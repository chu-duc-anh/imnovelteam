
import React from 'react';
import { User } from '../types';
import { ADMIN_AVATAR_URL } from '../constants';

interface AdminChatWidgetProps {
    currentUser: User | null;
    unreadCount: number;
    onOpenChat: () => void;
    onLoginClick: () => void;
}

const AdminChatWidget: React.FC<AdminChatWidgetProps> = ({ currentUser, unreadCount, onOpenChat, onLoginClick }) => {
    return (
        <div className="p-4 text-center">
             <div className="flex justify-center items-center mb-3">
                <img src={ADMIN_AVATAR_URL} alt="Admin Support Icon" className="w-16 h-16 rounded-full object-cover shadow-lg" />
             </div>
            <h2 className="font-serif text-2xl font-bold text-primary-800 dark:text-primary-100 mb-1">
                Hỗ trợ
            </h2>
            {currentUser ? (
                <div>
                    <p className="text-sm text-primary-600 dark:text-primary-400 mb-3">
                        Cần giúp đỡ? Chat trực tiếp với admin để được hỗ trợ.
                    </p>
                    <button 
                        onClick={onOpenChat}
                        className="w-full relative bg-gradient-to-r from-secondary-500 to-violet-500 hover:from-secondary-600 hover:to-violet-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-primary-900 focus:ring-secondary-400 flex items-center justify-center"
                    >
                        Bắt đầu Chat
                        {unreadCount > 0 && (
                            <span className="absolute top-0 right-0 -mt-1.5 -mr-1.5 flex justify-center items-center h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full border-2 border-white dark:border-primary-900">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>
                </div>
            ) : (
                <div>
                    <p className="text-sm text-primary-600 dark:text-primary-400 mb-3">
                        Vui lòng đăng nhập để có thể chat với admin.
                    </p>
                    <button 
                        onClick={onLoginClick}
                        className="w-full bg-gradient-to-r from-secondary-500 to-violet-500 hover:from-secondary-600 hover:to-violet-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        Đăng nhập
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminChatWidget;