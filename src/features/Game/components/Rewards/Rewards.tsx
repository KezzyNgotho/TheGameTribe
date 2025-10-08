import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

import Button from '@/components/buttons/Button';
import { useEthersSigner } from '@/utils/signer';
import { getChainConfig } from '@/config/contracts';
import { useRewardsContext } from '@/features/Game/contexts/RewardsContext';

const Rewards = () => {
  const signer = useEthersSigner();
  const { pendingCount, setPendingCount } = useRewardsContext();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!signer) return;
      try {
        const { mainContract } = getChainConfig(42101)!;
        const abi = [
          'function getPendingClaims(address) view returns (uint256)'
        ];
        const pool = new ethers.Contract(mainContract, abi, signer);
        const current = await pool.getPendingClaims(await signer.getAddress());
        setPendingCount(Number(ethers.BigNumber.from(current).toString()));
      } catch {}
    };
    load();
  }, [signer, setPendingCount]);

  const claim = async () => {
    if (!signer) return;
    setLoading(true);
    try {
      const { mainContract } = getChainConfig(42101)!;
      const abi = [
        'function getPendingClaims(address) view returns (uint256)',
        'function claimRewardAndMint(string name) external returns (uint256)'
      ];
      const pool = new ethers.Contract(mainContract, abi, signer);
      const pending = await pool.getPendingClaims(await signer.getAddress());
      if (ethers.BigNumber.from(pending).eq(0)) throw new Error('No pending reward to claim');
      const tx = await pool.claimRewardAndMint('GameTribe-Reward', { gasLimit: 500000 });
      await tx.wait();
      const after = await pool.getPendingClaims(await signer.getAddress());
      setPendingCount(Number(ethers.BigNumber.from(after).toString()));
      alert('Reward claimed successfully!');
    } catch (e: any) {
      alert(e?.message || 'Failed to claim reward');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='mx-auto max-w-[95vw] space-y-6 mobile-demo:w-[450px]'>
      <h2 className='text-lg font-bold text-primary-500'>Rewards</h2>
      <div className='rounded-lg border border-gray-200 p-4'>
        <div className='mb-2 text-sm text-gray-600'>Pending rewards</div>
        <div className='text-2xl font-semibold'>{pendingCount}</div>
      </div>
      <Button
        onClick={claim}
        variant='outline'
        className='py-5'
        disabled={loading || pendingCount === 0}
      >
        {loading ? 'Claiming...' : (pendingCount === 0 ? 'No Reward Available' : 'Claim Reward')}
      </Button>
    </div>
  );
};

export default Rewards;

