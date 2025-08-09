

import React, { useState, useMemo } from 'react';
import { User, Comment } from '../../types';
import LoadingSpinner from '../LoadingSpinner';
import { DEFAULT_AVATAR_URL } from '../../constants';
import Modal from '../Modal';
import RoleChangeModal from './RoleChangeModal';

interface UserManagementViewProps {
  users: User[];
  comments: Comment[];
  currentUser: User;
  onUpdateUserRole: (userId: string, newRole: 'user' | 'admin' | 'contractor') => Promise<void>;
  onDeleteUser: (userId: string) => void;
  onBack: () => void;
}

const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  comments,
  currentUser,
  onUpdateUserRole,
  onDeleteUser,
  onBack,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [roleModalState, setRoleModalState] = useState<{isOpen: boolean, user: User | null}>({isOpen: false, user: null});

  const commentCounts = useMemo(() => {
    const counts = new Map<string, number>();
    comments.forEach(comment => {
      if (comment.userId) { // Guard against missing userId
        counts.set(comment.userId.id, (counts.get(comment.userId.id) || 0) + 1);
      }
    });
    return counts;
  }, [comments]);

  const handleOpenRoleModal = (user: User) => {
    setRoleModalState({ isOpen: true, user });
  };

  const handleCloseRoleModal = () => {
    setRoleModalState({ isOpen: false, user: null });
  };

  const handleSaveRole = async (userId: string, newRole: 'user' | 'admin' | 'contractor') => {
    await onUpdateUserRole(userId, newRole);
    handleCloseRoleModal();
  };

  const getRoleClasses = (role: 'user' | 'admin' | 'contractor') => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300';
      case 'contractor':
        return 'bg-sky-100 dark:bg-sky-500/20 text-sky-800 dark:text-sky-300';
      case 'user':
      default:
        return 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300';
    }
  };

  const filteredUsers = users.filter(user =>
    user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const usersWithAllyInfo = useMemo(() => {
    return filteredUsers.map(user => ({
      ...user,
      allyOfUsername: user.allyOf ? user.allyOf.username : null,
    }));
  }, [filteredUsers]);

  return (
    <div className="max-w-5xl mx-auto my-8 p-4 sm:p-6 md:p-8 bg-primary-100/95 dark:bg-primary-950/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-primary-200/50 dark:border-primary-800/50">
      <div className="flex justify-between items-start mb-6">
        <h1 className="font-serif text-4xl font-bold text-primary-800 dark:text-primary-100">User Management</h1>
        <button
          onClick={onBack}
          className="text-sm text-secondary-600 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300 flex items-center group"
          aria-label="Back to previous page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back
        </button>
      </div>

      <div className="mb-6">
        <label htmlFor="user-search" className="sr-only">Search Users</label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-primary-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd"></path>
                </svg>
            </div>
            <input
              id="user-search"
              type="text"
              placeholder="Search by ID, username, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-primary-100 dark:bg-primary-800/80 border border-primary-300 dark:border-primary-700 rounded-lg shadow-sm focus:ring-secondary-500 focus:border-secondary-500 text-primary-900 dark:text-primary-100 placeholder-primary-400 dark:placeholder-primary-500"
            />
        </div>
      </div>

      <div className="md:hidden space-y-4">
        {usersWithAllyInfo.map(user => (
          <div key={user.id} className="bg-primary-50 dark:bg-primary-800/60 p-4 rounded-xl border border-primary-200 dark:border-primary-700/60 shadow-lg">
            <div className="flex items-center space-x-4 mb-4">
              <img className="h-14 w-14 rounded-full object-cover border-2 border-white dark:border-primary-700" src={user.picture || DEFAULT_AVATAR_URL} alt={`${user.username}'s avatar`} />
              <div className="flex-grow">
                <p className="font-semibold text-primary-800 dark:text-primary-100">{user.username}</p>
                <p className="text-sm text-primary-500 dark:text-primary-400 truncate">{user.email || 'No email'}</p>
                 {user.allyOfUsername && <p className="text-xs text-amber-600 dark:text-amber-400">Ally of: {user.allyOfUsername}</p>}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4 border-y border-primary-200 dark:border-primary-700 py-3">
              <div>
                <p className="font-bold text-primary-500 dark:text-primary-400 uppercase tracking-wider">Role</p>
                <span className={`mt-1 px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full ${getRoleClasses(user.role)}`}>
                  {user.role}
                </span>
              </div>
              <div>
                <p className="font-bold text-primary-500 dark:text-primary-400 uppercase tracking-wider">Race</p>
                <p className="text-primary-800 dark:text-primary-200 mt-1 font-medium">{user.race || 'N/A'}</p>
              </div>
              <div>
                <p className="font-bold text-primary-500 dark:text-primary-400 uppercase tracking-wider">Comments</p>
                <p className="text-primary-800 dark:text-primary-200 mt-1 font-medium">{commentCounts.get(user.id) || 0}</p>
              </div>
            </div>
            <div className="flex justify-end items-center space-x-3 text-sm">
                <button onClick={() => handleOpenRoleModal(user)} disabled={user.id === currentUser.id} className="font-semibold text-secondary-600 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-300 disabled:opacity-50 disabled:cursor-not-allowed">Change Role</button>
                <button onClick={() => onDeleteUser(user.id)} disabled={user.id === currentUser.id} className="font-semibold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed">Delete</button>
            </div>
          </div>
        ))}
        {usersWithAllyInfo.length === 0 && <p className="text-center py-10 text-primary-500 dark:text-primary-400">No users found.</p>}
      </div>
      
      <div className="overflow-x-auto hidden md:block rounded-lg border border-primary-200 dark:border-primary-800">
        <table className="min-w-full divide-y divide-primary-200 dark:divide-primary-800">
          <thead className="bg-primary-50 dark:bg-primary-800/60">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-primary-500 dark:text-primary-400 uppercase tracking-wider">User</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-primary-500 dark:text-primary-400 uppercase tracking-wider">Role</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-primary-500 dark:text-primary-400 uppercase tracking-wider">Race</th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-primary-500 dark:text-primary-400 uppercase tracking-wider">Comments</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-primary-500 dark:text-primary-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-primary-900 divide-y divide-primary-200 dark:divide-primary-800">
            {usersWithAllyInfo.map((user) => (
              <tr key={user.id} className="hover:bg-primary-50 dark:hover:bg-primary-800/40 transition-colors">
                <td className="whitespace-nowrap">
                   <button onClick={() => setViewingUser(user)} className="flex items-center text-left px-6 py-4 w-full">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img className="h-10 w-10 rounded-full object-cover" src={user.picture || DEFAULT_AVATAR_URL} alt={`${user.username}'s avatar`} />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-semibold text-primary-900 dark:text-primary-100">{user.username}</div>
                      <div className="text-sm text-primary-500 dark:text-primary-400">{user.email || 'No email provided'}</div>
                       {user.allyOfUsername && <div className="text-xs text-amber-600 dark:text-amber-400">Ally of: {user.allyOfUsername}</div>}
                    </div>
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full ${getRoleClasses(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600 dark:text-primary-300">{user.race || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-primary-600 dark:text-primary-300">{commentCounts.get(user.id) || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center space-x-4">
                       <button onClick={() => handleOpenRoleModal(user)} disabled={user.id === currentUser.id} className="font-semibold text-secondary-600 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-300 disabled:opacity-50 disabled:cursor-not-allowed" title={user.id === currentUser.id ? "Cannot change own role" : `Change role for ${user.username}`}>Change Role</button>
                      <button onClick={() => onDeleteUser(user.id)} disabled={user.id === currentUser.id} className="font-semibold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed" title={user.id === currentUser.id ? "Cannot delete self" : "Delete user"}>Delete</button>
                    </div>
                </td>
              </tr>
            ))}
             {usersWithAllyInfo.length === 0 && (
                <tr><td colSpan={5} className="text-center py-10 text-primary-500 dark:text-primary-400">No users found matching your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {viewingUser && (
        <Modal isOpen={!!viewingUser} onClose={() => setViewingUser(null)} title={`User Details`} size="sm">
            <div className="text-center">
                <img src={viewingUser.picture || DEFAULT_AVATAR_URL} alt="User Avatar" className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-white dark:border-primary-800 shadow-lg"/>
                <h2 className="text-xl font-serif font-bold text-primary-800 dark:text-primary-100">{viewingUser.name || viewingUser.username}</h2>
                {viewingUser.email && <p className="text-md text-primary-500 dark:text-primary-400">{viewingUser.email}</p>}
            </div>
            <div className="mt-6 pt-4 border-t border-primary-200 dark:border-primary-700 space-y-3 text-sm">
                <div className="flex justify-between"><span className="font-semibold text-primary-700 dark:text-primary-300">User ID:</span><span className="font-mono text-primary-600 dark:text-primary-400">{viewingUser.id}</span></div>
                <div className="flex justify-between items-center"><span className="font-semibold text-primary-700 dark:text-primary-300">Role:</span><span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full ${getRoleClasses(viewingUser.role)}`}>{viewingUser.role}</span></div>
                <div className="flex justify-between"><span className="font-semibold text-primary-700 dark:text-primary-300">Race:</span><span className="text-primary-600 dark:text-primary-400">{viewingUser.race || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="font-semibold text-primary-700 dark:text-primary-300">Comments:</span><span className="text-primary-600 dark:text-primary-400">{commentCounts.get(viewingUser.id) || 0}</span></div>
                <div className="flex justify-between"><span className="font-semibold text-primary-700 dark:text-primary-300">Login Type:</span><span className="text-primary-600 dark:text-primary-400">{viewingUser.passwordHash ? 'Password' : 'Google'}</span></div>
                {(viewingUser as any).allyOfUsername && <div className="flex justify-between"><span className="font-semibold text-primary-700 dark:text-primary-300">Ally Of:</span><span className="text-amber-600 dark:text-amber-400">{(viewingUser as any).allyOfUsername}</span></div>}
            </div>
        </Modal>
      )}
      {roleModalState.isOpen && roleModalState.user && (
        <RoleChangeModal
            isOpen={roleModalState.isOpen}
            onClose={handleCloseRoleModal}
            user={roleModalState.user}
            onSave={handleSaveRole}
        />
      )}
    </div>
  );
};

export default UserManagementView;