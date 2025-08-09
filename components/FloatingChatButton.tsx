import React from 'react';

interface FloatingChatButtonProps {
  unreadCount: number;
  onClick: () => void;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ unreadCount, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="relative w-14 h-14 bg-secondary-500 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-secondary-600 focus:outline-none focus:ring-4 focus:ring-secondary-500/50 transform transition-transform hover:scale-110 lg:hidden"
      aria-label="Open chat"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex justify-center items-center h-6 w-6 bg-red-600 text-white text-xs font-bold rounded-full border-2 border-white dark:border-primary-950">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default FloatingChatButton;