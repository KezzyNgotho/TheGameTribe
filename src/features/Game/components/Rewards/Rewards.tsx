import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';

import Button from '@/components/buttons/Button';
import { useEthersSigner } from '@/utils/signer';
import { getChainConfig } from '@/config/contracts';
import { useRewardsContext } from '@/features/Game/contexts/RewardsContext';

type RewardEvent = {
  type: 'Queued' | 'Claimed';
  tokenId?: string;
  txHash: string;
  blockNumber: number;
  timestamp?: number;
  image?: string;
};

const EXPLORER = 'https://donut.push.network';
const CACHE_KEY = (addr: string) => `gtb-reward-history-${addr}-42101`;

const Rewards = () => {
  const signer = useEthersSigner();
  const { pendingCount, setPendingCount } = useRewardsContext();
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [history, setHistory] = useState<RewardEvent[]>([]);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [networkOk, setNetworkOk] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Claimed' | 'Queued'>('All');
  const [loadedTxs, setLoadedTxs] = useState<Set<string>>(new Set());
  const [lastImgLoaded, setLastImgLoaded] = useState(false);

  const userAddress = useMemo(() => undefined, []);

  const loadPending = useCallback(async () => {
    if (!signer) return;
    try {
      const { mainContract } = getChainConfig(42101)!;
      const abi = ['function getPendingClaims(address) view returns (uint256)'];
      const pool = new ethers.Contract(mainContract, abi, signer);
      const current = await pool.getPendingClaims(await signer.getAddress());
      setPendingCount(Number(ethers.BigNumber.from(current).toString()));
    } catch {}
  }, [signer, setPendingCount]);

  const loadHistory = useCallback(async () => {
    if (!signer) return;
    setLoadingHistory(true);
    try {
      const provider = signer.provider as ethers.providers.Provider;
      const { mainContract, nftContract } = getChainConfig(42101)!;

      // Verify network
      try {
        const net = await provider.getNetwork();
        setNetworkOk((net?.chainId ?? 0) === 42101);
      } catch {}

      // Try cache first
      try {
        const cacheRaw = localStorage.getItem(CACHE_KEY((await signer.getAddress()).toLowerCase()));
        if (cacheRaw) {
          const cached = JSON.parse(cacheRaw) as RewardEvent[];
          setHistory(cached);
        }
      } catch {}

      const filterUser = (await signer.getAddress()).toLowerCase();

      // Minimal iface for events
      const iface = new ethers.utils.Interface([
        'event RewardClaimed(address indexed user, uint256 nftId)',
        'event PendingRewardQueued(address indexed user, uint256 pendingCount)'
      ]);

      // Define a recent window if full history is heavy
      const latest = await provider.getBlockNumber();
      const fromBlock = Math.max(0, latest - 120000); // ~recent window

      const claimedLogs = await provider.getLogs({
        address: mainContract,
        fromBlock,
        toBlock: 'latest',
        topics: [iface.getEventTopic('RewardClaimed')]
      });
      const queuedLogs = await provider.getLogs({
        address: mainContract,
        fromBlock,
        toBlock: 'latest',
        topics: [iface.getEventTopic('PendingRewardQueued')]
      });

      const events: RewardEvent[] = [];
      for (const log of claimedLogs) {
        const parsed = iface.parseLog(log);
        const user = (parsed.args.user as string).toLowerCase();
        if (user !== filterUser) continue;
        const tokenId = (parsed.args.nftId as ethers.BigNumber).toString();
        events.push({ type: 'Claimed', tokenId, txHash: log.transactionHash, blockNumber: log.blockNumber });
      }
      for (const log of queuedLogs) {
        const parsed = iface.parseLog(log);
        const user = (parsed.args.user as string).toLowerCase();
        if (user !== filterUser) continue;
        events.push({ type: 'Queued', txHash: log.transactionHash, blockNumber: log.blockNumber });
      }

      // Enrich with timestamps
      const blocksToFetch = Array.from(new Set(events.map(e => e.blockNumber)));
      const blockMap = new Map<number, number>();
      await Promise.all(blocksToFetch.map(async (bn) => {
        const b = await provider.getBlock(bn);
        blockMap.set(bn, (b?.timestamp ?? 0) * 1000);
      }));
      const enriched = events
        .map(e => ({ ...e, timestamp: blockMap.get(e.blockNumber) }))
        .sort((a, b) => (b.blockNumber - a.blockNumber));

      // Resolve tokenURI and attempt to fetch image (supports json metadata)
      const nftAbi = ['function tokenURI(uint256 tokenId) view returns (string)'];
      const nft = new ethers.Contract(nftContract, nftAbi, signer);
      const normalizeIpfs = (url: string) => url.startsWith('ipfs://') ? url.replace('ipfs://', 'https://ipfs.io/ipfs/') : url;
      const fetchImage = async (uri: string): Promise<string | undefined> => {
        try {
          const http = normalizeIpfs(uri);
          const res = await fetch(http);
          const ct = res.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const json = await res.json();
            const img = typeof json?.image === 'string' ? normalizeIpfs(json.image) : undefined;
            return img ?? http;
          }
          return http;
        } catch {
          return undefined;
        }
      };

      const resolved = await Promise.all(enriched.map(async (e) => {
        if (e.type === 'Claimed' && e.tokenId) {
          try {
            const uri: string = await nft.tokenURI(ethers.BigNumber.from(e.tokenId));
            const image = await fetchImage(uri);
            return { ...e, image };
          } catch {
            return e;
          }
        }
        return e;
      }));

      setHistory(resolved);
      setLastUpdated(Date.now());
      try { localStorage.setItem(CACHE_KEY(filterUser), JSON.stringify(resolved)); } catch {}
    } catch {}
    setLoadingHistory(false);
  }, [signer]);

  useEffect(() => {
    (async () => {
      await loadPending();
      await loadHistory();
    })();
    const id = window.setInterval(() => {
      loadPending();
      loadHistory();
    }, 30000);
    return () => window.clearInterval(id);
  }, [loadPending, loadHistory]);

  const claimOne = async () => {
    if (!signer) return;
    setLoading(true);
    try {
      const { mainContract, nftContract } = getChainConfig(42101)!;
      const abi = [
        'function getPendingClaims(address) view returns (uint256)',
        'function claimRewardAndMint(string name) external returns (uint256)'
      ];
      const pool = new ethers.Contract(mainContract, abi, signer);
      const pending = await pool.getPendingClaims(await signer.getAddress());
      if (ethers.BigNumber.from(pending).eq(0)) throw new Error('No pending reward to claim');
      const tx = await pool.claimRewardAndMint('GameTribe-Reward', { gasLimit: 500000 });
      const rc = await tx.wait();
      try {
        // Parse logs to extract tokenId
        const iface = new ethers.utils.Interface([
          'event RewardClaimed(address indexed user, uint256 nftId)'
        ]);
        const mine = (await signer.getAddress()).toLowerCase();
        let tokenIdParsed: string | undefined;
        for (const lg of rc.logs || []) {
          try {
            const parsed = iface.parseLog(lg);
            const user = (parsed.args.user as string).toLowerCase();
            if (user === mine) {
              tokenIdParsed = (parsed.args.nftId as ethers.BigNumber).toString();
              break;
            }
          } catch {}
        }
        let image: string | undefined;
        if (tokenIdParsed) {
          try {
            const nftAbi = ['function tokenURI(uint256 tokenId) view returns (string)'];
            const nft = new ethers.Contract(nftContract, nftAbi, signer);
            const uri: string = await nft.tokenURI(ethers.BigNumber.from(tokenIdParsed));
            image = uri.startsWith('ipfs://') ? uri.replace('ipfs://', 'https://ipfs.io/ipfs/') : uri;
          } catch {}
        }
        setHistory(prev => [
          {
            type: 'Claimed',
            tokenId: tokenIdParsed,
            txHash: tx.hash,
            blockNumber: rc?.blockNumber ?? 0,
            timestamp: Date.now(),
            image,
          },
          ...prev,
        ]);
      } catch {}
      await loadPending();
      await loadHistory();
      alert('Reward claimed successfully!');
    } catch (e: any) {
      alert(e?.message || 'Failed to claim reward');
    } finally {
      setLoading(false);
    }
  };

  const claimAll = async () => {
    if (!signer) return;
    setLoading(true);
    try {
      const { mainContract, nftContract } = getChainConfig(42101)!;
      const abi = [
        'function getPendingClaims(address) view returns (uint256)',
        'function claimRewardAndMint(string name) external returns (uint256)'
      ];
      const pool = new ethers.Contract(mainContract, abi, signer);
      let pending = await pool.getPendingClaims(await signer.getAddress());
      let remaining = ethers.BigNumber.from(pending).toNumber();
      if (remaining === 0) throw new Error('No pending rewards to claim');
      while (remaining > 0) {
        const tx = await pool.claimRewardAndMint('GameTribe-Reward', { gasLimit: 500000 });
        const rc = await tx.wait();
        try {
          const iface = new ethers.utils.Interface([
            'event RewardClaimed(address indexed user, uint256 nftId)'
          ]);
          const mine = (await signer.getAddress()).toLowerCase();
          let tokenIdParsed: string | undefined;
          for (const lg of rc.logs || []) {
            try {
              const parsed = iface.parseLog(lg);
              const user = (parsed.args.user as string).toLowerCase();
              if (user === mine) {
                tokenIdParsed = (parsed.args.nftId as ethers.BigNumber).toString();
                break;
              }
            } catch {}
          }
          let image: string | undefined;
          if (tokenIdParsed) {
            try {
              const nftAbi = ['function tokenURI(uint256 tokenId) view returns (string)'];
              const nft = new ethers.Contract(nftContract, nftAbi, signer);
              const uri: string = await nft.tokenURI(ethers.BigNumber.from(tokenIdParsed));
              image = uri.startsWith('ipfs://') ? uri.replace('ipfs://', 'https://ipfs.io/ipfs/') : uri;
            } catch {}
          }
          setHistory(prev => [
            {
              type: 'Claimed',
              tokenId: tokenIdParsed,
              txHash: tx.hash,
              blockNumber: rc?.blockNumber ?? 0,
              timestamp: Date.now(),
              image,
            },
            ...prev,
          ]);
        } catch {}
        remaining -= 1;
      }
      await loadPending();
      await loadHistory();
      alert('All rewards claimed!');
    } catch (e: any) {
      alert(e?.message || 'Failed to claim all');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (ms?: number) => (ms ? new Date(ms).toLocaleString() : '');
  const txLink = (hash: string) => `${EXPLORER}/tx/${hash}`;

  // Group history by calendar day for headers
  const grouped = useMemo(() => {
    const byDay = new Map<string, RewardEvent[]>();
    const source = history.filter(ev => filter === 'All' ? true : ev.type === filter);
    for (const ev of source) {
      const d = ev.timestamp ? new Date(ev.timestamp) : new Date();
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const arr = byDay.get(key) ?? [];
      arr.push(ev);
      byDay.set(key, arr);
    }
    return Array.from(byDay.entries()).sort((a,b) => (a[0] < b[0] ? 1 : -1));
  }, [history, filter]);

  const lastClaimed = useMemo(() => history.find((e) => e.type === 'Claimed'), [history]);

  return (
    <div className='mx-auto max-w-[95vw] space-y-6 mobile-demo:w-[450px]'>
      {!networkOk && (
        <div className='rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-xs text-yellow-800'>
          Wrong network. Switch to Push Donut (42101) to claim and view history.
        </div>
      )}
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-bold text-primary-500'>Rewards</h2>
        <button
          className='text-sm text-primary-500 underline'
          onClick={() => { loadPending(); loadHistory(); }}
          aria-label='Refresh rewards'
        >
          Refresh
        </button>
      </div>

      {lastClaimed && (
        <div className='flex items-center gap-3 rounded-xl border border-gray-200 p-3 shadow-sm'>
          {lastClaimed.image && (
            <img
              src={lastClaimed.image}
              alt='Last claimed NFT'
              className={`h-12 w-12 shrink-0 rounded-lg object-cover ${lastImgLoaded ? '' : 'animate-pulse bg-gray-200'}`}
              onLoad={() => setLastImgLoaded(true)}
            />
          )}
          <div className='min-w-0'>
            <div className='truncate text-sm font-medium'>Last claimed {lastClaimed.tokenId ? `#${lastClaimed.tokenId}` : ''}</div>
            <div className='text-xs text-gray-500'>{fmt(lastClaimed.timestamp)}</div>
          </div>
          <a className='ml-auto shrink-0 text-xs text-primary-500 underline' href={txLink(lastClaimed.txHash)} target='_blank' rel='noreferrer'>View</a>
        </div>
      )}

      <div className='rounded-lg border border-gray-200 p-4'>
        <div className='mb-1 flex items-center justify-between'>
          <div className='text-sm text-gray-600'>Pending rewards</div>
          {lastUpdated && (
            <div className='text-xs text-gray-400'>Updated {fmt(lastUpdated)}</div>
          )}
        </div>
        <div className='mb-4 text-2xl font-semibold'>{pendingCount}</div>
        <div className='flex gap-3'>
          <Button onClick={claimOne} variant='outline' className='py-3' disabled={loading || pendingCount === 0}>
            {loading ? 'Working...' : 'Claim One'}
          </Button>
          <Button onClick={claimAll} variant='outline' className='py-3' disabled={loading || pendingCount === 0}>
            {loading ? 'Working...' : 'Claim All'}
          </Button>
        </div>
      </div>

      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <div className='text-sm font-semibold text-gray-700'>History</div>
          <div className='flex items-center gap-2'>
            {(['All','Claimed','Queued'] as const).map(k => (
              <button
                key={k}
                className={`rounded-full px-3 py-1 text-xs ${filter===k ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}
                onClick={() => setFilter(k)}
                aria-label={`Filter ${k}`}
              >{k}</button>
            ))}
          </div>
        </div>
        {loadingHistory ? (
          <div className='text-sm text-gray-500'>Loading history…</div>
        ) : history.length === 0 ? (
          <div className='rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500'>
            No history yet. Play a quiz to earn rewards.
          </div>
        ) : (
          <div className='space-y-4'>
            {grouped.map(([day, items]) => (
              <div key={day} className='space-y-2'>
                <div className='text-xs font-semibold uppercase text-gray-500'>{day}</div>
                <ul className='space-y-2'>
                  {items.map((ev, idx) => (
                    <li key={`${day}-${idx}`} className='flex items-center justify-between rounded-lg border border-gray-200 p-3'>
                      <div className='flex min-w-0 items-center gap-3'>
                        {ev.type === 'Claimed' && ev.image && (
                          <img
                            src={ev.image}
                            alt='NFT'
                            className={`h-10 w-10 shrink-0 rounded-md object-cover ${loadedTxs.has(ev.txHash) ? '' : 'animate-pulse bg-gray-200'}`}
                            onLoad={() => setLoadedTxs(prev => new Set(prev).add(ev.txHash))}
                          />
                        )}
                        <span className={
                          ev.type === 'Claimed' ? 'rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700' : 'rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700'
                        }>
                          {ev.type}
                        </span>
                        <div className='min-w-0'>
                          <div className='truncate text-sm'>
                            {ev.type === 'Claimed' ? `Token #${ev.tokenId ?? '—'}` : 'Queued reward'}
                          </div>
                          <div className='text-xs text-gray-500'>{fmt(ev.timestamp)}</div>
                        </div>
                      </div>
                      <a className='shrink-0 text-xs text-primary-500 underline' href={txLink(ev.txHash)} target='_blank' rel='noreferrer'>View</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Rewards;

