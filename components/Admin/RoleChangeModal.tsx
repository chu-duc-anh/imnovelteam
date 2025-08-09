
import React, { useState } from 'react';
import Modal from '../Modal';
import LoadingSpinner from '../LoadingSpinner';
import { User } from '../../types';
import { DEFAULT_AVATAR_URL } from '../../constants';

interface RoleChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSave: (userId: string, newRole: 'user' | 'admin' | 'contractor') => Promise<void>;
}

const RoleChangeModal: React.FC<RoleChangeModalProps> = ({ isOpen, onClose, user, onSave }) => {
  const [selectedRole, setSelectedRole] = useState<'user' | 'admin' | 'contractor'>(user.role);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (selectedRole === user.role) {
      onClose();
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await onSave(user.id, selectedRole);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save role. Please try again.");
      setIsLoading(false);
    } 
  };

  const roles: {id: 'user' | 'admin' | 'contractor', name: string, description: string}[] = [
    { id: 'user', name: 'User', description: 'Standard user with basic permissions.' },
    { id: 'contractor', name: 'Nhà dịch thầu', description: 'Can be assigned translation tasks.' },
    { id: 'admin', name: 'Admin', description: 'Full access to all administrative features.' },
  ];

  const footerContent = (
    <div className="flex justify-end w-full space-x-2">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 bg-primary-500 hover:bg-primary-400 dark:bg-primary-600 dark:hover:bg-primary-500 text-white text-sm font-medium rounded-md"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleSave}
        disabled={isLoading || selectedRole === user.role}
        className="px-4 py-2 bg-secondary-600 text-white text-sm font-medium rounded-md hover:bg-secondary-700 disabled:opacity-50 flex items-center justify-center min-w-[80px]"
      >
        {isLoading ? <LoadingSpinner size="sm" /> : 'Save'}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Change Role for ${user.username}`}
      footerContent={footerContent}
      size="md"
    >
        {error && <p className="mb-4 text-center text-sm text-red-500 bg-red-100 dark:bg-red-900/50 p-2.5 rounded-lg">{error}</p>}
      <div className="flex items-center mb-4">
        <img src={user.picture || DEFAULT_AVATAR_URL} alt={user.username} className="w-12 h-12 rounded-full mr-4" />
        <div>
          <p className="font-semibold text-primary-800 dark:text-primary-100">{user.name || user.username}</p>
          <p className="text-sm text-primary-500 dark:text-primary-400">{user.email}</p>
        </div>
      </div>
      <div className="space-y-3 mt-4">
        {roles.map(roleInfo => (
          <label
            key={roleInfo.id}
            className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
              selectedRole === roleInfo.id
                ? 'border-secondary-500 bg-secondary-50 dark:bg-secondary-900/30'
                : 'border-primary-200 dark:border-primary-700 hover:border-secondary-400'
            }`}
          >
            <input
              type="radio"
              name="role"
              value={roleInfo.id}
              checked={selectedRole === roleInfo.id}
              onChange={() => setSelectedRole(roleInfo.id)}
              className="h-4 w-4 text-secondary-600 border-primary-300 focus:ring-secondary-500"
            />
            <div className="ml-3 text-sm">
              <p className="font-medium text-primary-900 dark:text-primary-100">{roleInfo.name}</p>
              <p className="text-primary-500 dark:text-primary-400">{roleInfo.description}</p>
            </div>
          </label>
        ))}
      </div>
    </Modal>
  );
};

export default RoleChangeModal;
