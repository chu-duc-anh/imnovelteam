
import React from 'react';
import Fireworks from './Fireworks';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  type?: 'error' | 'success' | 'info';
  footerContent?: React.ReactNode; 
  size?: 'sm' | 'md' | 'lg' | 'xl'; 
  showFireworks?: boolean;
}

const Modal: React.FC<ModalProps> = ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    type = 'info', 
    footerContent,
    size = 'md',
    showFireworks = false,
}) => {
  if (!isOpen) return null;
  
  const iconColor = 
    type === 'error' ? 'text-red-500' : 
    type === 'success' ? 'text-green-500' : 
    'text-secondary-500';
  
  const iconBgColor =
    type === 'error' ? 'bg-red-100 dark:bg-red-500/10' :
    type === 'success' ? 'bg-green-100 dark:bg-green-500/10' :
    'bg-secondary-100 dark:bg-secondary-500/10';

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  const Icon = () => {
    switch (type) {
        case 'error': return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case 'success': return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        default: return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    }
  }

  return (
    <div 
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-lg flex items-center justify-center p-4 z-[100] transition-opacity duration-300 ease-in-out animate-fade-in"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
    >
      <div 
        className={`relative bg-white dark:bg-primary-900 rounded-2xl shadow-2xl w-full ${sizeClasses[size]} transform transition-all duration-300 ease-out flex flex-col max-h-[90vh] animate-scale-up border border-primary-200/50 dark:border-primary-800/50`}
        onClick={(e) => e.stopPropagation()}
      >
        {showFireworks && <Fireworks />}
        <div className="p-6 flex-shrink-0 flex items-start justify-between">
            <div className="flex items-start gap-4">
                <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${iconBgColor}`}>
                    <div className={iconColor}><Icon /></div>
                </div>
                <div className="mt-0 text-left">
                     <h3 id="modal-title" className="text-lg font-semibold font-serif text-primary-900 dark:text-primary-100">{title}</h3>
                </div>
            </div>
            <button 
                onClick={onClose} 
                className="text-primary-400 dark:text-primary-500 hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-secondary-500"
                aria-label="Close modal"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        <div className="px-6 pb-6 text-primary-600 dark:text-primary-300 leading-relaxed overflow-y-auto">
          {children}
        </div>
        {footerContent && 
            <div className="px-6 py-4 bg-primary-50 dark:bg-primary-900/50 rounded-b-2xl text-right border-t border-primary-200 dark:border-primary-800 flex-shrink-0">
            {footerContent}
            </div>
        }
      </div>
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes scale-up {
            from { opacity: 0; transform: scale(0.95) translateY(20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-scale-up { animation: scale-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default Modal;
