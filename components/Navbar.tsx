import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { DEFAULT_AVATAR_URL } from '../constants';
import UserProfilePopover from './UserProfilePopover'; 

interface NavbarProps {
  currentUser: User | null;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onHomeClick: () => void;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onLogoutClick: () => void;
  onSearchChange: (searchTerm: string) => void;
  searchTerm: string;
  onShowUserProfile: () => void;
  onShowUserManagement: () => void;
  onShowMyStories: () => void;
  onShowAllyManagement: () => void;
  onShowTeamStories: () => void;
  onUpdateAvatar: (newAvatarDataUrl: string) => Promise<void>;
  onShowSiteSettings: () => void;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  currentUser, 
  theme,
  onToggleTheme,
  onHomeClick, 
  onLoginClick,
  onRegisterClick,
  onLogoutClick,
  onSearchChange,
  searchTerm,
  onShowUserProfile,
  onShowUserManagement,
  onShowMyStories,
  onShowAllyManagement,
  onShowTeamStories,
  onUpdateAvatar,
  onShowSiteSettings,
  isMusicPlaying,
  onToggleMusic,
}) => {
  const [isProfilePopoverOpen, setIsProfilePopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsProfilePopoverOpen(false);
      }
    };
    if (isProfilePopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfilePopoverOpen]);

  const isArchangel = currentUser?.race === 'Tổng lãnh thiên thần';

  return (
    <nav className="sticky top-0 z-50 transition-colors duration-500 bg-primary-100/80 dark:bg-primary-950/80 backdrop-blur-lg border-b border-primary-200/50 dark:border-primary-800/50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <button 
              onClick={onHomeClick} 
              className="flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 focus:ring-offset-primary-100 dark:focus:ring-offset-primary-950 rounded-full p-1 flex items-center space-x-2"
              aria-label="Go to homepage"
            >
              <img src="https://i.imgur.com/AeZt9RG.jpeg" alt="IMnovel Team Icon" className="h-10 w-10 rounded-full object-cover" />
              <span className="font-serif text-xl font-bold text-primary-800 dark:text-primary-100 hidden sm:block pr-2">IMnovel Team</span>
            </button>
            <button
              onClick={onToggleMusic}
              className="p-2 rounded-full text-primary-500 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 focus:ring-offset-primary-100 dark:focus:ring-offset-primary-950 transition-colors ml-2"
              aria-label={isMusicPlaying ? 'Pause background music' : 'Play background music'}
            >
              {isMusicPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
              )}
            </button>
          </div>

          <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-end">
            <div className="max-w-lg w-full lg:max-w-xs">
              <label htmlFor="search" className="sr-only">Tìm kiếm truyện</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-primary-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="search"
                  name="search"
                  className="block w-full pl-10 pr-3 py-2.5 border border-primary-300 dark:border-primary-700 rounded-full leading-5 bg-primary-200/50 dark:bg-primary-800/50 text-primary-900 dark:text-primary-100 placeholder-primary-500 dark:placeholder-primary-500 focus:outline-none focus:bg-white dark:focus:bg-primary-900 focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500 sm:text-sm transition-colors duration-300"
                  placeholder="Tìm truyện..."
                  type="search"
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center ml-4">
            <button
                onClick={onToggleTheme}
                className="p-2 rounded-full text-primary-500 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 focus:ring-offset-primary-100 dark:focus:ring-offset-primary-950 transition-colors"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
                {theme === 'light' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                    </svg>
                )}
            </button>
            {currentUser ? (
              <div className="flex items-center space-x-2 ml-3">
                <div ref={popoverRef} className="relative">
                    <button 
                    onClick={() => setIsProfilePopoverOpen(prev => !prev)}
                    className="rounded-full flex items-center focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 focus:ring-offset-primary-100 dark:focus:ring-offset-primary-950"
                    aria-label="Open user menu"
                    aria-expanded={isProfilePopoverOpen}
                    aria-haspopup="true"
                    >
                        <img 
                            src={currentUser.picture || DEFAULT_AVATAR_URL}
                            alt="User avatar"
                            className={`w-10 h-10 rounded-full object-cover border-2 border-primary-300 dark:border-primary-700 hover:border-secondary-400 transition-colors duration-300 ${isArchangel ? 'archangel-avatar-halo' : ''}`}
                        />
                    </button>
                    {isProfilePopoverOpen && (
                        <UserProfilePopover
                            currentUser={currentUser}
                            onLogout={() => {
                            setIsProfilePopoverOpen(false);
                            onLogoutClick();
                            }}
                            onShowUserProfile={() => {
                            setIsProfilePopoverOpen(false);
                            onShowUserProfile();
                            }}
                            onShowUserManagement={() => {
                            setIsProfilePopoverOpen(false);
                            onShowUserManagement();
                            }}
                             onShowMyStories={() => {
                                setIsProfilePopoverOpen(false);
                                onShowMyStories();
                            }}
                            onShowAllyManagement={() => {
                                setIsProfilePopoverOpen(false);
                                onShowAllyManagement();
                            }}
                            onShowTeamStories={() => {
                                setIsProfilePopoverOpen(false);
                                onShowTeamStories();
                            }}
                            onShowSiteSettings={() => {
                                setIsProfilePopoverOpen(false);
                                onShowSiteSettings();
                            }}
                            onUpdateAvatar={onUpdateAvatar}
                            onClose={() => setIsProfilePopoverOpen(false)}
                            theme={theme}
                        />
                    )}
                </div>
                <span className="text-sm font-medium text-primary-700 dark:text-primary-300 hidden sm:block">
                  Hello, {currentUser.name || currentUser.username}
                </span>
              </div>
            ) : (
               <div className="hidden sm:flex items-center ml-2 space-x-2">
                 <button 
                  onClick={onLoginClick}
                  className="px-4 py-2 rounded-full text-sm font-semibold text-primary-700 dark:text-primary-200 hover:bg-primary-200/70 dark:hover:bg-primary-800/70 transition-colors duration-300"
                 >
                   Login
                 </button>
                 <button 
                   onClick={onRegisterClick}
                   className="text-white bg-secondary-500 hover:bg-secondary-600 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors duration-300 shadow-lg shadow-secondary-500/20 hover:shadow-secondary-500/40"
                 >
                   Register
                 </button>
               </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
