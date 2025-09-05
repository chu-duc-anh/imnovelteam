

import React, { useState, useRef } from 'react';
import { User } from '../types';
import { fileToDataUrl } from '../utils';
import LoadingSpinner from './LoadingSpinner';
import AvatarCropModal from './AvatarCropModal';

interface UserProfilePopoverProps {
    currentUser: User;
    onLogout: () => void;
    onUpdateAvatar: (newAvatarDataUrl: string) => Promise<void>;
    onClose: () => void;
    theme: 'light' | 'dark';
    onShowUserProfile?: () => void;
    onShowUserManagement?: () => void;
    onShowMyStories?: () => void;
    onShowAllyManagement?: () => void;
    onShowTeamStories?: () => void;
    onShowSiteSettings?: () => void;
    onShowBookmarkedStories?: () => void;
}

const UserProfilePopover: React.FC<UserProfilePopoverProps> = ({ currentUser, onLogout, onUpdateAvatar, onClose, onShowUserProfile, onShowUserManagement, onShowMyStories, onShowAllyManagement, onShowTeamStories, onShowSiteSettings, onShowBookmarkedStories }) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [cropModalState, setCropModalState] = useState({ isOpen: false, imageSrc: '' });
    const isArchangel = currentUser.race === 'Tổng lãnh thiên thần';
    const canManageStories = currentUser.role === 'admin' || currentUser.role === 'contractor';

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
        setError(null);
        try {
            await onUpdateAvatar(croppedDataUrl);
        } catch(err) {
            setError(err instanceof Error ? err.message : "Failed to upload image.");
        } finally {
            setIsUpdating(false);
            setCropModalState({ isOpen: false, imageSrc: '' });
        }
    };

    return (
        <>
            <div className="absolute right-0 mt-3 w-64 bg-primary-100/80 dark:bg-primary-900/80 backdrop-blur-lg rounded-xl shadow-2xl border border-primary-200/50 dark:border-primary-800/50 z-50 p-4 transform transition-all origin-top-right animate-scale-in">
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <img
                            src={currentUser.picture}
                            alt="User Avatar"
                            className={`w-20 h-20 rounded-full object-cover border-4 border-white dark:border-primary-800 shadow-lg ${isArchangel ? 'archangel-avatar-halo' : ''}`}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute -bottom-1 -right-1 bg-white dark:bg-primary-700 rounded-full p-1.5 shadow-md hover:bg-primary-200 dark:hover:bg-primary-600 transition-colors"
                            aria-label="Change avatar"
                            disabled={isUpdating}
                        >
                            {isUpdating ? <LoadingSpinner size="sm"/> : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-600 dark:text-primary-300" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                                </svg>
                            )}
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>
                
                    <p className="font-semibold font-serif text-primary-800 dark:text-primary-100 mt-3 text-lg truncate w-full text-center">{currentUser.name || currentUser.username}</p>
                    {currentUser.email && <p className="text-sm text-primary-500 dark:text-primary-400 truncate w-full text-center">{currentUser.email}</p>}
                    {error && <p className="text-xs text-red-500 mt-2 text-center">{error}</p>}
                </div>
                <div className="mt-4 pt-4 border-t border-primary-200 dark:border-primary-800 space-y-1">
                    {onShowUserProfile && <button
                        onClick={() => {
                            onShowUserProfile();
                            onClose();
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-primary-700 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-800 rounded-md transition-colors flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zM12 11a4 4 0 100 8 4 4 0 000-8z" clipRule="evenodd" />
                        </svg>
                        View Profile
                    </button>}
                    {onShowBookmarkedStories && (
                        <button
                            onClick={() => {
                                onShowBookmarkedStories();
                                onClose();
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-primary-700 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-800 rounded-md transition-colors flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                            </svg>
                            Truyện đã theo dõi
                        </button>
                    )}
                    {canManageStories && onShowMyStories && (
                        <button
                            onClick={() => {
                                onShowMyStories();
                                onClose();
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-primary-700 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-800 rounded-md transition-colors flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
                            Dịch truyện của bạn
                        </button>
                    )}
                    {currentUser.allyOf && onShowTeamStories && (
                        <button
                            onClick={() => {
                                onShowTeamStories();
                                onClose();
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-primary-700 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-800 rounded-md transition-colors flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1z" />
                            </svg>
                            Giao diện truyện của team
                        </button>
                    )}
                    {currentUser.role === 'contractor' && onShowAllyManagement && (
                        <button
                            onClick={() => {
                                onShowAllyManagement();
                                onClose();
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-primary-700 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-800 rounded-md transition-colors flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M12.5 9.25a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5zM5 6.25a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5zM12.5 10.75a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5zM5 10.75a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5zM10.75 12.5a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5zM3.5 12.5a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5zM12.5 15.25a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5z" />
                            <path d="M16.75 4.5a.75.75 0 000-1.5h-2.5a.75.75 0 000 1.5h2.5zM9.25 4.5a.75.75 0 000-1.5h-2.5a.75.75 0 000 1.5h2.5zM17.5 8.75a.75.75 0 01-.75.75h-2.5a.75.75 0 010-1.5h2.5a.75.75 0 01.75.75zM10 8.75a.75.75 0 01-.75.75h-2.5a.75.75 0 010-1.5h2.5a.75.75 0 01.75.75zM16.75 13a.75.75 0 000-1.5h-2.5a.75.75 0 000 1.5h2.5zM9.25 13a.75.75 0 000-1.5h-2.5a.75.75 0 000 1.5h2.5z" />
                            </svg>
                            Quản lý đồng minh
                        </button>
                    )}
                    {currentUser.role === 'admin' && onShowUserManagement && (
                        <button
                            onClick={() => {
                                onShowUserManagement();
                                onClose();
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-primary-700 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-800 rounded-md transition-colors flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                            </svg>
                            Manage Users
                        </button>
                    )}
                     {currentUser.role === 'admin' && onShowSiteSettings && (
                        <button
                            onClick={() => {
                                onShowSiteSettings();
                                onClose();
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-primary-700 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-primary-800 rounded-md transition-colors flex items-center"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                            </svg>
                            Site Settings
                        </button>
                    )}
                    <button
                        onClick={onLogout}
                        className="w-full text-left px-3 py-2 text-sm text-red-500 dark:text-red-400 font-medium hover:bg-red-100 dark:hover:bg-red-900/40 rounded-md transition-colors flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                        </svg>
                        Logout
                    </button>
                </div>
                <style>{`
                    @keyframes scale-in {
                        from { opacity: 0; transform: scale(0.95); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    .animate-scale-in { animation: scale-in 0.15s ease-out forwards; }
                `}</style>
            </div>
            {cropModalState.isOpen && (
                <AvatarCropModal
                    isOpen={cropModalState.isOpen}
                    onClose={() => setCropModalState({ isOpen: false, imageSrc: '' })}
                    imageSrc={cropModalState.imageSrc}
                    onSave={handleSaveCroppedAvatar}
                />
            )}
        </>
    );
};

export default UserProfilePopover;
