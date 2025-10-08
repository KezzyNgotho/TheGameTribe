import React, { ReactNode, useContext, useState } from 'react';

type RewardsContextType = {
  pendingCount: number;
  setPendingCount: React.Dispatch<React.SetStateAction<number>>;
};

const RewardsContext = React.createContext<RewardsContextType>({} as RewardsContextType);

export const useRewardsContext = () => {
  const ctx = useContext(RewardsContext);
  if (!ctx) throw new Error('useRewardsContext must be used within RewardsContextProvider');
  return ctx;
};

const RewardsContextProvider = ({ children }: { children: ReactNode }) => {
  const [pendingCount, setPendingCount] = useState<number>(0);
  return (
    <RewardsContext.Provider value={{ pendingCount, setPendingCount }}>
      {children}
    </RewardsContext.Provider>
  );
};

export default RewardsContextProvider;

