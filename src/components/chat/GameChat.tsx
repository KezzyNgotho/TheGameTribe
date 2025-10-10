import React, { useState } from 'react';
import { useAccount } from 'wagmi';

const GameChat = () => {
  const { address, isConnected } = useAccount();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Welcome to GameTribe Community Chat! 🎮',
      sender: 'System',
      timestamp: new Date(),
    },
    {
      id: 2,
      text: 'Connect your wallet to start chatting with other players!',
      sender: 'System',
      timestamp: new Date(),
    },
  ]);

  const handleSendMessage = () => {
    if (!message.trim() || !address) return;

    const newMessage = {
      id: messages.length + 1,
      text: message,
      sender: address.slice(0, 6) + '...' + address.slice(-4),
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isConnected || !address) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="rounded-lg bg-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Connect Wallet to Chat</h3>
          <p className="text-gray-400 text-sm">
            Please connect your wallet to join the GameTribe community chat.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg">
      {/* Chat Header */}
      <div className="bg-gray-800 p-4 rounded-t-lg border-b border-gray-700">
        <h3 className="text-white font-semibold">GameTribe Community</h3>
        <p className="text-gray-400 text-sm">Connected as {address.slice(0, 6)}...{address.slice(-4)}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-500">{msg.sender}</span>
              <span className="text-xs text-gray-600">
                {msg.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 max-w-xs">
              <p className="text-white text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-primary-500 focus:outline-none"
          />
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Chat feature coming soon! This is a demo version.
        </p>
      </div>
    </div>
  );
};

export default GameChat;
