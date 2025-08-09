import React, { useMemo, useState, useEffect } from 'react';
import { LeaderboardUser } from '../types';
import { DEFAULT_AVATAR_URL } from '../constants';

interface LeaderboardProps {
  topUsers: LeaderboardUser[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ topUsers }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
        const now = new Date();
        const nextUpdate = new Date(now);

        if (now.getMinutes() >= 30) {
            // If in the second half of the hour, target the next hour at :30
            nextUpdate.setHours(now.getHours() + 1);
            nextUpdate.setMinutes(30, 0, 0);
        } else {
            // If in the first half, target this hour at :30
            nextUpdate.setMinutes(30, 0, 0);
        }

        const diffInSeconds = Math.max(0, Math.round((nextUpdate.getTime() - now.getTime()) / 1000));
        setTimeLeft(diffInSeconds);
    };
    
    // Calculate immediately and then set an interval to update every second
    calculateTimeLeft();
    const intervalId = setInterval(calculateTimeLeft, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []); // Run only on mount

  const formatTime = (seconds: number) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      
      if (h > 0) {
          return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      }
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getMedalStyle = (rank: number, type: 'border' | 'text') => {
    const styles = {
      border: ['border-accent-400', 'border-primary-400', 'border-accent-700'],
      text: ['text-accent-400', 'text-primary-400', 'text-accent-700'],
    };
    if (rank < 3) return styles[type][rank];
    return type === 'border' ? 'border-primary-200 dark:border-primary-700' : 'text-primary-500 dark:text-primary-400';
  };
  
  const medalEmoji = ['🥇', '🥈', '🥉'];

  return (
    <div className="flex flex-col">
      <div className="p-4 border-b border-primary-200 dark:border-primary-800 flex-shrink-0 flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <div>
            <h2 className="font-serif text-xl font-bold text-primary-800 dark:text-primary-100">
              Bảng Xếp Hạng
            </h2>
            <p className="text-xs text-primary-500 dark:text-primary-400">
                Top tương tác. Cập nhật sau: <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
            </p>
        </div>
      </div>
      <div className="flex-grow p-3">
        {topUsers.length > 0 ? (
          <ul className="space-y-2">
            {topUsers.map((user, index) => {
              const isArchangel = user.race === 'Tổng lãnh thiên thần';
              return (
              <li key={user.id} className={`flex items-center space-x-3 p-2 rounded-xl transition-colors duration-200 ${
                  isArchangel 
                    ? 'bg-gradient-to-r from-yellow-100/50 dark:from-yellow-900/20 to-transparent' 
                    : (index < 3 ? 'bg-primary-100 dark:bg-primary-800/70' : 'hover:bg-primary-100 dark:hover:bg-primary-800/50')
                }`}>
                <div className={`font-bold text-xl w-8 h-8 flex items-center justify-center flex-shrink-0`}>
                    {index < 3 ? medalEmoji[index] : <span className="text-primary-400 dark:text-primary-500 text-sm">{index + 1}</span>}
                </div>
                <img src={user.picture || DEFAULT_AVATAR_URL} alt={user.username} className={`w-11 h-11 rounded-full object-cover border-2 flex-shrink-0 ${isArchangel ? 'archangel-avatar-halo' : getMedalStyle(index, 'border')}`} />
                <div className="flex-grow overflow-hidden">
                  <p className="font-semibold text-sm text-primary-800 dark:text-primary-200 truncate">{user.username}</p>
                   {isArchangel ? (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full archangel-race-badge">{user.race}</span>
                    ) : (
                        <p className="text-xs text-secondary-600 dark:text-secondary-400 font-bold truncate">{user.race}</p>
                    )}
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="font-bold text-lg text-primary-700 dark:text-primary-200">{user.totalScore}</p>
                  <p className="text-xs text-primary-400 dark:text-primary-500">Điểm</p>
                </div>
              </li>
            )})}
          </ul>
        ) : (
          <p className="text-center text-sm text-primary-500 dark:text-primary-400 py-10">Chưa có ai bình luận. Hãy là người đầu tiên!</p>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;