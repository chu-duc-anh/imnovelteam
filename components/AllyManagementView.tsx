
import React, { useState, useMemo, useEffect } from 'react';
import { User } from '../types';
import { DEFAULT_AVATAR_URL } from '../constants';
import LoadingSpinner from './LoadingSpinner';
import { authService } from '../../services/authService';

interface AllyManagementViewProps {
  currentUser: User;
  onBack: () => void;
}

const AllyManagementView: React.FC<AllyManagementViewProps> = ({
  currentUser,
  onBack,
}) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingState, setLoadingState] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const users = await authService.getAllUsers();
            setAllUsers(users);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load users.");
        } finally {
            setIsLoading(false);
        }
    };
    fetchUsers();
  }, []);

  const myAllies = useMemo(() => {
    return allUsers.filter(user => user.allyOf?.id === currentUser.id);
  }, [allUsers, currentUser.id]);

  const searchResults = useMemo(() => {
    if (!searchTerm) return [];
    return allUsers.filter(user =>
      user.role === 'user' &&
      !user.allyOf &&
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, allUsers]);

  const onManageAlly = async (action: 'add' | 'remove', allyUsername: string) => {
    setLoadingState(prev => ({ ...prev, [allyUsername]: true }));
    setError(null);
    try {
      await authService.manageAlly(action, allyUsername);
      // Refetch users to get the latest state
      const updatedUsers = await authService.getAllUsers();
      setAllUsers(updatedUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setLoadingState(prev => ({ ...prev, [allyUsername]: false }));
    }
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-96">
            <LoadingSpinner size="lg" message="Loading user data..."/>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-8 p-4 sm:p-6 md:p-8 bg-primary-100/95 dark:bg-primary-950/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-primary-200/50 dark:border-primary-800/50">
      <div className="flex justify-between items-start mb-6">
        <h1 className="font-serif text-4xl font-bold text-primary-800 dark:text-primary-100">Quản lý đồng minh</h1>
        <button onClick={onBack} className="text-sm text-secondary-600 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300 flex items-center group">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
          Back
        </button>
      </div>

      {error && <p className="mb-4 text-center text-sm text-red-500 bg-red-100 dark:bg-red-900/50 p-2.5 rounded-lg">{error}</p>}

      {/* Current Allies Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold font-serif text-primary-800 dark:text-primary-200 mb-4">Đồng minh hiện tại của bạn</h2>
        {myAllies.length > 0 ? (
          <ul className="space-y-3">
            {myAllies.map(ally => (
              <li key={ally.id} className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-800/60 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <img src={ally.picture || DEFAULT_AVATAR_URL} alt={ally.username} className="w-10 h-10 rounded-full object-cover"/>
                  <div>
                    <p className="font-semibold text-primary-900 dark:text-primary-100">{ally.username}</p>
                    <p className="text-sm text-primary-500 dark:text-primary-400">{ally.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => onManageAlly('remove', ally.username)}
                  disabled={loadingState[ally.username]}
                  className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-100 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-300 dark:hover:bg-red-500/30 rounded-full transition-colors disabled:opacity-50"
                >
                  {loadingState[ally.username] ? <LoadingSpinner size="sm"/> : 'Gỡ bỏ'}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-primary-500 dark:text-primary-400 text-sm">Bạn chưa có đồng minh nào.</p>
        )}
      </div>

      {/* Add New Ally Section */}
      <div>
        <h2 className="text-xl font-semibold font-serif text-primary-800 dark:text-primary-200 mb-4">Thêm đồng minh mới</h2>
        <div className="mb-4">
            <input
              type="text"
              placeholder="Tìm kiếm người dùng theo tên đăng nhập..."
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-4 py-2.5 bg-primary-100 dark:bg-primary-800 border border-primary-300 dark:border-primary-700 rounded-lg shadow-sm focus:ring-secondary-500 focus:border-secondary-500 text-primary-900 dark:text-primary-100 placeholder-primary-400 dark:placeholder-primary-500"
            />
        </div>

        {searchTerm && (
          <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
            {searchResults.length > 0 ? (
              searchResults.map(user => (
                <div key={user.id} className="flex items-center justify-between p-2 bg-primary-50 dark:bg-primary-800/60 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img src={user.picture || DEFAULT_AVATAR_URL} alt={user.username} className="w-8 h-8 rounded-full object-cover"/>
                    <p className="font-medium text-sm text-primary-800 dark:text-primary-200">{user.username}</p>
                  </div>
                   <button
                     onClick={() => onManageAlly('add', user.username)}
                     disabled={loadingState[user.username]}
                     className="px-3 py-1.5 text-xs font-semibold text-green-600 bg-green-100 hover:bg-green-200 dark:bg-green-500/20 dark:text-green-300 dark:hover:bg-green-500/30 rounded-full transition-colors disabled:opacity-50"
                    >
                     {loadingState[user.username] ? <LoadingSpinner size="sm"/> : 'Thêm'}
                    </button>
                </div>
              ))
            ) : (
              <p className="text-primary-500 dark:text-primary-400 text-sm text-center py-4">Không tìm thấy người dùng phù hợp.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllyManagementView;
