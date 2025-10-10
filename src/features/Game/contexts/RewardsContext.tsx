import React, { ReactNode, useContext, useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export interface GameNotification {
  id: string;
  title: string;
  message: string;
  icon?: string;
  image?: string;
  cta?: string;
  url?: string;
  timestamp: number;
  type: 'reward' | 'betting' | 'leaderboard' | 'social';
}

type RewardsContextType = {
  pendingCount: number;
  setPendingCount: React.Dispatch<React.SetStateAction<number>>;
  notifications: GameNotification[];
  addNotification: (notification: Omit<GameNotification, 'id' | 'timestamp'>) => void;
  clearNotifications: () => void;
};

const RewardsContext = React.createContext<RewardsContextType>({} as RewardsContextType);

export const useRewardsContext = () => {
  const ctx = useContext(RewardsContext);
  if (!ctx) throw new Error('useRewardsContext must be used within RewardsContextProvider');
  return ctx;
};

const RewardsContextProvider = ({ children }: { children: ReactNode }) => {
  const { address } = useAccount();
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<GameNotification[]>([]);

  // Load notifications from localStorage
  useEffect(() => {
    if (address) {
      const storedNotifications = localStorage.getItem(`notifications-${address}`);
      if (storedNotifications) {
        try {
          setNotifications(JSON.parse(storedNotifications));
        } catch (error) {
          console.error('Failed to parse stored notifications:', error);
        }
      }
    }
  }, [address]);

  // Save notifications to localStorage
  useEffect(() => {
    if (address && notifications.length > 0) {
      localStorage.setItem(`notifications-${address}`, JSON.stringify(notifications));
    }
  }, [notifications, address]);

  const addNotification = (notification: Omit<GameNotification, 'id' | 'timestamp'>) => {
    const newNotification: GameNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50 notifications
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <RewardsContext.Provider 
      value={{ 
        pendingCount, 
        setPendingCount, 
        notifications, 
        addNotification, 
        clearNotifications 
      }}
    >
      {children}
    </RewardsContext.Provider>
  );
};

export default RewardsContextProvider;