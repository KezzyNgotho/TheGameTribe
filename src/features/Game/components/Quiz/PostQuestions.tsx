import { Capacitor } from '@capacitor/core';
import clsx from 'clsx';
import React, { useState, useEffect } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { CiMedal } from 'react-icons/ci';
import { ethers } from 'ethers';

import Account from '@/components/account/Account';
import Button from '@/components/buttons/Button';

import LeaderBoardTable from '@/features/Game/components/Quiz/leader-board-table/LeaderBoardTable';
import NFTThumbnail from '@/features/Game/components/Quiz/NFTThumbnail';
import { useQuizContext } from '@/features/Game/contexts/QuizContext';
import { useEthersSigner } from '@/utils/signer';
import { nftContractABI } from '@/contract-constant';
import { getChainConfig } from '@/config/contracts';
import { useRewardsContext } from '@/features/Game/contexts/RewardsContext';

const PostQuestions = () => {
  const { preQuestions, reset } = useQuizContext();
  const [quizPoints, setQuizPoints] = useState(0);
  const signer = useEthersSigner();
  const [loading, setLoading] = useState(false);
  const [pendingCount, setPendingCount] = useState<ethers.BigNumber | null>(null);
  const [initialized, setInitialized] = useState(false);
  const { setPendingCount: setGlobalPending } = useRewardsContext();

  useEffect(() => {
    // Generate random points between 0 and 4999
    const points = Math.floor(Math.random() * 5000);
    setQuizPoints(points);
  }, []);

  // Ensure reward is queued on win (screen entry), and fetch pending count
  useEffect(() => {
    const run = async () => {
      if (!signer || initialized) return;
      try {
        const { mainContract } = getChainConfig(42101)!;
        const poolAbi = [
          'function createUser() external returns (uint256)',
          'function getUserDetails(address) view returns (uint256 owedValue, uint256 uuid)',
          'function getPendingClaims(address) view returns (uint256)',
          'function queueReward() external'
        ];
        const pool = new ethers.Contract(mainContract, poolAbi, signer);

        // Ensure registration
        try {
          const [, uuid] = await pool.getUserDetails(await signer.getAddress());
          if (ethers.BigNumber.from(uuid).eq(0)) {
            const regTx = await pool.createUser();
            await regTx.wait();
          }
        } catch {
          try { const regTx = await pool.createUser(); await regTx.wait(); } catch {}
        }

        // Fetch pending and queue if none exists yet
        const current = await pool.getPendingClaims(await signer.getAddress());
        if (ethers.BigNumber.from(current).eq(0)) {
          const qtx = await pool.queueReward();
          await qtx.wait();
          const after = await pool.getPendingClaims(await signer.getAddress());
          setPendingCount(after);
          try { setGlobalPending(Number(ethers.BigNumber.from(after).toString())); } catch {}
          // lightweight toast
          try {
            if (typeof window !== 'undefined') {
              // Use alert for now as lightweight toast substitute
              // In the future, replace with a proper toast component
              window.setTimeout(() => alert('Reward saved. Claim anytime.'), 0);
            }
          } catch {}
        } else {
          setPendingCount(current);
          try { setGlobalPending(Number(ethers.BigNumber.from(current).toString())); } catch {}
        }
      } catch {
        // non-fatal UI can proceed without count
      } finally {
        setInitialized(true);
      }
    };
    run();
  }, [signer, initialized]);

  const handleQuizDone = async () => {
    reset();
  };

  const claimReward = async () => {
    if (!signer) return;
    setLoading(true);
    try {
      const { mainContract } = getChainConfig(42101)!; // Pool only
      // Minimal ABI for getPendingClaims and claim
      const poolAbi = [
        'function getPendingClaims(address) view returns (uint256)',
        'function claimRewardAndMint(string name) external returns (uint256)',
        'event RewardClaimed(address indexed user, uint256 nftId)'
      ];
      const pool = new ethers.Contract(mainContract, poolAbi, signer);

      // Require there's a pending claim
      const pending = await pool.getPendingClaims(await signer.getAddress());
      if (ethers.BigNumber.from(pending).eq(0)) {
        throw new Error('No pending reward to claim');
      }

      // Mint and transfer to caller, consumes one pending claim
      const tx = await pool.claimRewardAndMint('GameTribe-Reward', { gasLimit: 500000 });
      await tx.wait();

      alert('Reward claimed successfully!');

      // Refresh pending count
      try {
        const after = await pool.getPendingClaims(await signer.getAddress());
        setPendingCount(after);
        try { setGlobalPending(Number(ethers.BigNumber.from(after).toString())); } catch {}
      } catch {}
    } catch (error) {
      console.error('Error claiming reward:', error);
      if (error instanceof Error) {
        alert(`Error claiming reward. Please try again. ${error.message}`);
      } else {
        alert('Error claiming reward. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={clsx(
        Capacitor.getPlatform() === 'ios' &&
          'mt-8 pt-[calc(env(safe-area-inset-bottom))]',
        'relative flex flex-col'
      )}
    >
      <span
        className='absolute right-0 top-0 text-3xl'
        onClick={() => handleQuizDone()}
      >
        <AiOutlineClose />
      </span>
      <div className='text-gradient-primary flex w-full flex-col items-center gap-1'>
        <span className='h2 block font-secondary'>Good Job!</span>
        <span className='font-secondary'>You Get +{quizPoints} Quiz Points</span>
      </div>

      <NFTThumbnail className='mt-6' NFTFlowId={preQuestions.NFTFlowId} />
      <div className='relative -top-9 mx-auto flex w-3/5 items-center justify-center'>
        <div className='text-gradient-primary mb-4 flex items-center gap-1'>
          <span className='text-3xl text-primary-500'>
            <CiMedal />
          </span>
          <span className='font-primary text-lg'>REWARD</span>
        </div>
      </div>

      <>
        <Account />
        <LeaderBoardTable className='mt-6' />
      </>

      {pendingCount !== null && (
        <div className='mt-4 text-center text-sm text-gray-600'>
          Pending rewards: {ethers.BigNumber.from(pendingCount).toString()}
        </div>
      )}

      <Button
        onClick={claimReward}
        variant='outline'
        className='mt-4 py-5'
        disabled={loading || (pendingCount !== null && ethers.BigNumber.from(pendingCount).eq(0))}
      >
        {loading
          ? 'Claiming...'
          : (pendingCount !== null && ethers.BigNumber.from(pendingCount).eq(0)
              ? 'No Reward Available'
              : 'Claim Reward')}
      </Button>
    </div>
  );
};

export default PostQuestions;