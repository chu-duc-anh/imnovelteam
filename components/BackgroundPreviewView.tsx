
import React from 'react';

interface BackgroundPreviewViewProps {
  onBack: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const BackgroundPreviewView: React.FC<BackgroundPreviewViewProps> = ({ onBack, theme, onToggleTheme }) => {
  const buttonClasses = "bg-black/50 text-white font-semibold py-2 px-4 rounded-lg backdrop-blur-md transition-colors duration-300 hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white flex items-center gap-2";
  
  return (
    <div className="fixed inset-0 z-[100] p-4 sm:p-6 flex justify-between items-start">
      <button
        onClick={onBack}
        className={buttonClasses}
        aria-label="Exit preview"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Quay lại
      </button>

       <button
        onClick={onToggleTheme}
        className={`${buttonClasses} p-2.5`}
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
    </div>
  );
};

export default BackgroundPreviewView;
