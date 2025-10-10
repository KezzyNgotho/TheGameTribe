import React, { useState, useEffect } from 'react';
import { NotificationItem } from '@pushprotocol/uiweb';
import { useAccount } from 'wagmi';

interface GameNotification {
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

const NotificationCenter = () => {
  const { address, isConnected } = useAccount();
  const [notifications, setNotifications] = useState<GameNotification[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock notifications for demonstration - replace with real Push notifications
  useEffect(() => {
    if (!isConnected || !address) return;

    const mockNotifications: GameNotification[] = [
      {
        id: '1',
        title: 'Reward Available!',
        message: 'You have earned 500 points from your last quiz!',
        icon: '🎁',
        type: 'reward',
        timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
      },
      {
        id: '2',
        title: 'Betting Pool Update',
        message: 'New betting pool "NBA Finals" is now live!',
        icon: '🏀',
        type: 'betting',
        timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
      },
      {
        id: '3',
        title: 'Leaderboard Alert',
        message: 'You moved up to position #3 on the leaderboard!',
        icon: '🏆',
        type: 'leaderboard',
        timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
      },
      {
        id: '4',
        title: 'Community Message',
        message: 'New message in GameTribe chat from @Player123',
        icon: '💬',
        type: 'social',
        timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
      },
    ];

    setNotifications(mockNotifications);
  }, [address, isConnected]);

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleNotificationClick = (notification: GameNotification) => {
    if (notification.url) {
      window.open(notification.url, '_blank');
    }
    // Mark as read or handle notification action
    console.log('Notification clicked:', notification);
  };

  if (!isConnected || !address) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="rounded-lg bg-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Connect Wallet for Notifications</h3>
          <p className="text-gray-400 text-sm">
            Connect your wallet to receive real-time notifications about rewards, betting updates, and community activity.
          </p>
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="rounded-lg bg-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-2">No Notifications</h3>
          <p className="text-gray-400 text-sm">
            You're all caught up! New notifications will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Notifications</h3>
        <button
          onClick={() => setNotifications([])}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Clear All
        </button>
      </div>
      
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="rounded-lg bg-gray-800 p-4 hover:bg-gray-700 transition-colors cursor-pointer"
          onClick={() => handleNotificationClick(notification)}
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl">{notification.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-white truncate">
                  {notification.title}
                </h4>
                <span className="text-xs text-gray-400 ml-2">
                  {formatTime(notification.timestamp)}
                </span>
              </div>
              <p className="text-sm text-gray-300 mt-1">
                {notification.message}
              </p>
              {notification.cta && (
                <div className="mt-2">
                  <span className="text-xs text-primary-500 font-medium">
                    {notification.cta} →
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationCenter;
