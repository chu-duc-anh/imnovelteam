
import React, { useState } from 'react';
import Modal from '../Modal';
import LoadingSpinner from '../LoadingSpinner';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (oldPassword: string, newPassword: string) => Promise<void>;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!oldPassword || !newPassword) {
      setError("All fields are required.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(oldPassword, newPassword);
      // Success is handled by the parent component (closing modal, showing info)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password.");
    } finally {
      setIsLoading(false);
    }
  };

  const formInputClasses = "w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400";
  
  const footerContent = (
    <div className="flex justify-end w-full">
      <button type="button" onClick={onClose} className="px-4 py-2 mr-2 bg-gray-500 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-white text-sm font-medium rounded-md">Cancel</button>
      <button 
        type="submit" 
        form="change-password-form" 
        disabled={isLoading} 
        className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 disabled:opacity-50"
      >
        {isLoading ? <LoadingSpinner size="sm" /> : 'Update Password'}
      </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Password" footerContent={footerContent} size="md">
        <form id="change-password-form" onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="p-3 text-sm text-red-100 bg-red-600 dark:bg-red-700 rounded-md shadow-lg">{error}</p>}
             <div>
                <label htmlFor="old-password"  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Old Password</label>
                <input
                    id="old-password"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className={formInputClasses}
                    required
                />
            </div>
             <div>
                <label htmlFor="new-password"  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={formInputClasses}
                    required
                />
            </div>
             <div>
                <label htmlFor="confirm-password"  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={formInputClasses}
                    required
                />
            </div>
        </form>
    </Modal>
  );
};

export default ChangePasswordModal;
