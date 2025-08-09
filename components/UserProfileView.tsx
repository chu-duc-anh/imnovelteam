

import React, { useState, useRef } from 'react';
import { User } from '../types';
import { fileToDataUrl } from '../utils';
import { DEFAULT_AVATAR_URL } from '../constants';
import LoadingSpinner from './LoadingSpinner';
import RaceSelectionModal from './RaceSelectionModal';
import AvatarCropModal from './AvatarCropModal';

interface UserProfileViewProps {
  currentUser: User;
  onUpdateAvatar: (newAvatarDataUrl: string) => Promise<void>;
  onUpdateRace: (newRace: string) => Promise<void>;
  onShowChangePasswordModal: () => void;
  onLeaveAllyTeam: () => void;
  onBack: () => void;
  theme: 'light' | 'dark';
}

const UserProfileView: React.FC<UserProfileViewProps> = ({ currentUser, onUpdateAvatar, onUpdateRace, onShowChangePasswordModal, onLeaveAllyTeam, onBack, theme }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showRaceModal, setShowRaceModal] = useState(false);
  const [cropModalState, setCropModalState] = useState({ isOpen: false, imageSrc: '' });

  const isEmailUser = !!currentUser.passwordHash;
  const isArchangel = currentUser.race === 'Tổng lãnh thiên thần';

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      try {
        const dataUrl = await fileToDataUrl(file);
        setCropModalState({ isOpen: true, imageSrc: dataUrl });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load image file.");
      }
    }
  };

  const handleSaveCroppedAvatar = async (croppedDataUrl: string) => {
    setIsUpdating(true);
    try {
        await onUpdateAvatar(croppedDataUrl);
    } catch(err) {
        setError(err instanceof Error ? err.message : "Failed to upload image.");
    } finally {
        setIsUpdating(false);
        setCropModalState({ isOpen: false, imageSrc: '' });
    }
  };

  const handleSaveRace = async (newRace: string) => {
    setIsUpdating(true);
    setError(null);
    try {
        await onUpdateRace(newRace);
    } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update race. Please try again.");
        throw err;
    } finally {
        setIsUpdating(false);
    }
  };

  const buttonStyle = "w-full sm:w-auto px-4 py-2 bg-primary-200 dark:bg-primary-700/80 text-primary-800 dark:text-primary-200 font-semibold rounded-lg hover:bg-primary-300 dark:hover:bg-primary-600/80 transition-colors duration-300 shadow-sm";


  return (
    <>
    <div className={`max-w-3xl mx-auto my-8 p-6 md:p-8 bg-primary-100/95 dark:bg-primary-950/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-primary-200/50 dark:border-primary-800/50 ${isArchangel ? 'archangel-profile' : ''}`}>
      <div className="flex justify-between items-start mb-6">
        <h1 className="font-serif text-4xl font-bold text-primary-800 dark:text-primary-100">Profile</h1>
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

      <div className="text-center">
        <div className="relative inline-block">
            <img
            src={currentUser.picture || DEFAULT_AVATAR_URL}
            alt="User Avatar"
            className={`w-36 h-36 rounded-full mx-auto mb-4 object-cover border-4 border-white dark:border-primary-800 shadow-2xl ${isArchangel ? 'archangel-avatar-halo' : ''}`}
            />
             {isUpdating && (
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center transition-opacity duration-300">
                    <LoadingSpinner size="md" />
                </div>
            )}
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUpdating}
                className="absolute bottom-2 right-2 bg-white dark:bg-primary-700 p-2 rounded-full shadow-lg hover:bg-primary-200 dark:hover:bg-primary-600 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-secondary-500 disabled:opacity-50"
                aria-label="Change Avatar"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-700 dark:text-primary-200" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                </svg>
            </button>
             <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden"/>
        </div>

        <h2 className="text-3xl font-serif font-bold text-primary-900 dark:text-primary-100">{currentUser.name || currentUser.username}</h2>
        {currentUser.email && (
          <p className="text-md text-primary-500 dark:text-primary-400">{currentUser.email}</p>
        )}
        <div className="mt-4 space-y-2">
            <div className="inline-block bg-primary-100/50 dark:bg-primary-800/50 rounded-full px-4 py-2 shadow-inner">
                <span className="text-sm font-semibold text-primary-600 dark:text-primary-300">Chủng loài: </span>
                 {isArchangel ? (
                    <span className="text-lg font-bold archangel-text-gradient archangel-text-glow">{currentUser.race}</span>
                 ) : (
                    <span className="text-md text-secondary-600 dark:text-secondary-400 font-bold">{currentUser.race || 'Chưa có'}</span>
                 )}
            </div>
             {currentUser.allyOf && (
                <div className="inline-block bg-amber-100/50 dark:bg-amber-800/50 rounded-full px-4 py-2 shadow-inner ml-2">
                    <span className="text-sm font-semibold text-amber-600 dark:text-amber-300">Đồng minh</span>
                </div>
            )}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-primary-200 dark:border-primary-800">
        <h3 className="font-serif text-xl font-semibold text-primary-800 dark:text-primary-200 mb-4">Settings</h3>
        {error && <p className="mb-3 text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/50 p-3 rounded-lg text-sm">{error}</p>}
        
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          {currentUser.allyOf && (
            <button onClick={onLeaveAllyTeam} className={`${buttonStyle} bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/50`}>
                Rời khỏi team
            </button>
          )}
          {currentUser.role !== 'admin' && (
            <>
              <button onClick={() => setShowRaceModal(true)} className={buttonStyle}>Cập nhật chủng loài</button>
            </>
          )}
          {isEmailUser && (
            <button onClick={onShowChangePasswordModal} className={buttonStyle}>
              Change Password
            </button>
          )}
        </div>
      </div>
    </div>
    {cropModalState.isOpen && (
        <AvatarCropModal
            isOpen={cropModalState.isOpen}
            onClose={() => setCropModalState({ isOpen: false, imageSrc: '' })}
            imageSrc={cropModalState.imageSrc}
            onSave={handleSaveCroppedAvatar}
        />
    )}
    <RaceSelectionModal isOpen={showRaceModal} onClose={() => setShowRaceModal(false)} onSave={handleSaveRace} currentRace={currentUser.race || 'Nhân tộc'} />
    </>
  );
};

export default UserProfileView;