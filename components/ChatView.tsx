import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, ChatThread, ChatMessage } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { ADMIN_AVATAR_URL, DEFAULT_AVATAR_URL } from '../constants';
import { chatService } from '../services/chatService';

interface ChatViewProps {
  currentUser: User;
  chatThreads: ChatThread[];
  onSendMessage: (text: string, receiverId: string) => Promise<void>;
  onMarkMessagesAsRead: (threadUserId: string) => void;
  onDeleteThread: (threadId: string) => void;
  onBack: () => void;
}

// --- Helper Functions & Sub-components ---

const getSenderId = (message: ChatMessage): string => {
    if (typeof message.senderId === 'object' && message.senderId !== null) {
        return message.senderId.id;
    }
    return message.senderId as string;
};

const formatTimestamp = (timestamp: number, type: 'full' | 'time' | 'threadList') => {
  const date = new Date(timestamp);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  if (type === 'threadList') {
      if (date >= startOfToday) {
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
          return date.toLocaleDateString([], { month: 'numeric', day: 'numeric' });
      }
  }

  if (type === 'full') {
    return date.toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  // time only
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}


const MessageBubble = React.memo(({ msg, sender, isSentByCurrentUser, isFirstInBlock, isLastInBlock }: {
  msg: ChatMessage;
  sender: User | Partial<User>;
  isSentByCurrentUser: boolean;
  isFirstInBlock: boolean;
  isLastInBlock: boolean;
}) => {
  const avatarSrc = sender.picture || (sender.id === 'admin' ? ADMIN_AVATAR_URL : DEFAULT_AVATAR_URL);
  const bubbleClasses = isSentByCurrentUser
    ? 'bg-secondary-500 text-white'
    : 'bg-white dark:bg-primary-800 text-primary-900 dark:text-primary-100';

  return (
    <div className={`w-full flex items-end gap-2.5 max-w-[85%] ${isSentByCurrentUser ? 'ml-auto flex-row-reverse' : 'mr-auto flex-row'}`}>
      <div className="flex-shrink-0 w-8">
        {isLastInBlock && <img src={avatarSrc} alt={sender.username || 'User'} className="w-8 h-8 rounded-full object-cover" />}
      </div>
      <div className={`flex flex-col w-full ${isSentByCurrentUser ? 'items-end' : 'items-start'}`}>
        <div className={`${bubbleClasses} px-3.5 py-2.5 rounded-xl shadow-md break-words whitespace-pre-wrap`}>
          <p>{msg.text}</p>
        </div>
        {isLastInBlock && (
          <p className="text-xs text-primary-400 dark:text-primary-500 mt-1 px-1">
            {formatTimestamp(msg.timestamp, 'time')}
          </p>
        )}
      </div>
    </div>
  );
});


const MessageArea = React.memo(({ messages, currentUser, otherParticipant, onMessagesEndRef }: {
    messages: ChatMessage[],
    currentUser: User,
    otherParticipant: User | Partial<User>,
    onMessagesEndRef: React.RefObject<HTMLDivElement>
}) => {
    const TEN_MINUTES = 10 * 60 * 1000;

    if (!messages || messages.length === 0) {
        return (
            <div className="text-center text-primary-500 dark:text-primary-400 py-10">
                <p>Không có tin nhắn nào. Hãy gửi một tin nhắn để bắt đầu cuộc trò chuyện.</p>
            </div>
        );
    }

    return (
      <div id="messages" className="flex-1 p-4 sm:p-6 space-y-1 overflow-y-auto">
        {messages.map((msg, index) => {
          const prevMsg = messages[index - 1];
          const nextMsg = messages[index + 1];

          const showTimestampHeader = !prevMsg || (msg.timestamp - prevMsg.timestamp > TEN_MINUTES);
          
          const currentSenderId = getSenderId(msg);
          const isSentByCurrentUser = currentSenderId === currentUser.id;

          const senderForBubble = isSentByCurrentUser ? currentUser : otherParticipant;

          const isFirstInBlock = !prevMsg || getSenderId(prevMsg) !== currentSenderId || (msg.timestamp - prevMsg.timestamp > TEN_MINUTES);
          const isLastInBlock = !nextMsg || getSenderId(nextMsg) !== currentSenderId || (nextMsg.timestamp - msg.timestamp > TEN_MINUTES);

          return (
              <React.Fragment key={msg.id}>
                  {showTimestampHeader && (
                      <div className="text-center text-xs text-primary-500 dark:text-primary-400 my-4">
                          {formatTimestamp(msg.timestamp, 'full')}
                      </div>
                  )}
                   <div className={isFirstInBlock ? 'mt-4' : ''}>
                      <MessageBubble 
                          msg={msg} 
                          sender={senderForBubble}
                          isSentByCurrentUser={isSentByCurrentUser}
                          isFirstInBlock={isFirstInBlock}
                          isLastInBlock={isLastInBlock}
                      />
                   </div>
              </React.Fragment>
          );
      })}
      <div ref={onMessagesEndRef} />
    </div>
  );
});

const ChatInput = ({ messageText, setMessageText, handleSendMessage, isSending, disabled }: {
    messageText: string,
    setMessageText: (text: string) => void,
    handleSendMessage: (e: React.FormEvent) => Promise<void>,
    isSending: boolean,
    disabled: boolean
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if(textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [messageText]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    }

    return (
        <div className="p-3 sm:p-4 border-t border-primary-200 dark:border-primary-800 bg-white dark:bg-primary-900 flex-shrink-0">
            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <textarea
                    ref={textareaRef}
                    rows={1}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập tin nhắn..."
                    disabled={disabled}
                    className="flex-grow w-full px-4 py-2 bg-primary-100 dark:bg-primary-800 border border-primary-300 dark:border-primary-700 rounded-2xl shadow-inner resize-none max-h-32 focus:ring-secondary-500 focus:border-secondary-500 text-primary-900 dark:text-primary-100 placeholder-primary-500 dark:placeholder-primary-400 disabled:bg-primary-100 dark:disabled:bg-primary-800/50"
                />
                <button type="submit" disabled={isSending || !messageText.trim()} className="p-3 bg-secondary-500 text-white rounded-full hover:bg-secondary-600 disabled:opacity-50 transition-colors flex-shrink-0 shadow-lg shadow-secondary-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500">
                    {isSending ? <div className="w-5 h-5"><LoadingSpinner size="sm" /></div> : 
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>}
                </button>
            </form>
        </div>
    );
};


// --- Main View Component ---

const ChatView: React.FC<ChatViewProps> = ({ currentUser, chatThreads, onSendMessage, onMarkMessagesAsRead, onDeleteThread, onBack }) => {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAdmin = currentUser.role === 'admin';
  
  const isUnlimitedUser = useMemo(() => currentUser.role === 'admin' || currentUser.role === 'contractor', [currentUser.role]);
  const [remainingMessages, setRemainingMessages] = useState(isUnlimitedUser ? -1 : 0);

  useEffect(() => {
    if (!isUnlimitedUser) {
        const fetchRemaining = async () => {
            try {
                const limitInfo = await chatService.getRemainingMessages();
                setRemainingMessages(limitInfo.remaining);
            } catch (err) { console.error("Failed to fetch message limit", err); setRemainingMessages(0); }
        };
        fetchRemaining();
    }
  }, [isUnlimitedUser, currentUser.id]);


  const sortedThreads = useMemo(() => {
    return [...chatThreads].sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);
  }, [chatThreads]);

  const activeThread = useMemo(() => {
    if (isAdmin) return sortedThreads.find(t => t.id === selectedThreadId);
    return sortedThreads.length > 0 ? sortedThreads[0] : undefined;
  }, [isAdmin, sortedThreads, selectedThreadId]);


  useEffect(() => {
    if (isAdmin && !selectedThreadId && sortedThreads.length > 0) {
      if (window.innerWidth >= 768) {
        setSelectedThreadId(sortedThreads[0].id);
      }
    }
  }, [isAdmin, sortedThreads, selectedThreadId]);
  
  useEffect(() => {
    setShowChatPanel(selectedThreadId !== null);
  }, [selectedThreadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [selectedThreadId, showChatPanel]);

  useEffect(() => {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeThread?.messages]);

  useEffect(() => {
    const threadIdToMark = isAdmin ? selectedThreadId : activeThread?.userId;
    if (threadIdToMark) {
        onMarkMessagesAsRead(threadIdToMark);
    }
  }, [selectedThreadId, activeThread, isAdmin, onMarkMessagesAsRead]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setError(null);
    setIsSending(true);

    try {
      const receiverId = isAdmin ? selectedThreadId : 'admin';
      if (!receiverId) throw new Error("No user selected to send a message to.");
      await onSendMessage(messageText, receiverId);
      setMessageText('');
      if (!isUnlimitedUser) setRemainingMessages(prev => Math.max(0, prev - 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };
  
  const handleLocalDelete = () => {
    if (activeThread) {
        onDeleteThread(activeThread.id);
        setSelectedThreadId(null);
    }
  };

  const messageLimitText = `Bạn còn ${remainingMessages} tin nhắn hôm nay.`;
  
  const getUnreadCountForThread = (threadId: string) => {
    const thread = chatThreads.find(t => t.id === threadId);
    if (!thread) return 0;
    return thread.messages.filter(msg => msg.receiverId === currentUser.id && !msg.isRead).length;
  };

  const renderUserView = () => {
    const otherParticipant = useMemo((): User => ({
        id: activeThread?.userId || 'admin',
        username: "Hỗ trợ quản trị viên",
        name: "Hỗ trợ quản trị viên",
        picture: ADMIN_AVATAR_URL,
        role: 'admin',
    }), [activeThread]);

    const messages = activeThread?.messages || [];

    return (
    <div className="flex flex-col h-full bg-primary-100 dark:bg-primary-950 shadow-2xl rounded-2xl overflow-hidden border border-primary-200 dark:border-primary-800">
        <div className="p-4 border-b border-primary-200 dark:border-primary-800 flex items-center gap-4 flex-shrink-0 bg-white dark:bg-primary-900">
             <img src={otherParticipant.picture || ADMIN_AVATAR_URL} alt={otherParticipant.username} className="w-11 h-11 rounded-full object-cover"/>
             <div>
                 <h3 className="font-semibold text-lg text-primary-800 dark:text-primary-100">{otherParticipant.username}</h3>
                 <p className="text-sm text-green-500 flex items-center gap-1.5">
                    <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                    Online
                </p>
             </div>
        </div>
        <MessageArea messages={messages} currentUser={currentUser} otherParticipant={otherParticipant} onMessagesEndRef={messagesEndRef} />
        <ChatInput 
            messageText={messageText} 
            setMessageText={setMessageText} 
            handleSendMessage={handleSendMessage}
            isSending={isSending}
            disabled={!isUnlimitedUser && (remainingMessages <= 0 || isSending)}
        />
        {!isUnlimitedUser && (
            <p className={`text-xs p-2 text-center bg-white dark:bg-primary-900 ${remainingMessages > 0 ? 'text-primary-500 dark:text-primary-400' : 'text-red-500 dark:text-red-400'}`}>
                {messageLimitText}
            </p>
        )}
    </div>
    );
  };

  const renderAdminView = () => {
    const threadUsers = useMemo(() => {
        const userMap = new Map<string, User>();
        chatThreads.forEach(t => userMap.set(t.userId, {
            id: t.userId,
            username: t.userName,
            name: t.userName,
            picture: t.userAvatar,
            role: 'user',
        }));
        return userMap;
    }, [chatThreads]);

    return (
        <div className="flex h-full border border-primary-200 dark:border-primary-700/60 rounded-2xl shadow-2xl overflow-hidden relative bg-white dark:bg-primary-900">
            {/* --- Conversation List Panel (Sidebar) --- */}
            <div className={`
                absolute md:relative top-0 left-0 h-full z-20 
                w-full md:w-2/5 lg:w-1/3 md:flex-shrink-0 
                border-r border-primary-200 dark:border-primary-800 
                flex flex-col bg-white dark:bg-primary-900
                transition-transform duration-300 ease-in-out
                ${showChatPanel ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`
            }>
                <div className="p-4 border-b border-primary-200 dark:border-primary-800 flex-shrink-0">
                    <h2 className="font-semibold text-xl font-serif text-primary-800 dark:text-primary-200">Tin nhắn</h2>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {sortedThreads.map(thread => {
                        const unreadCount = getUnreadCountForThread(thread.id);
                        const lastMessage = thread.messages[thread.messages.length - 1];
                        return (
                            <button
                                key={thread.id}
                                onClick={() => setSelectedThreadId(thread.id)}
                                className={`w-full text-left p-3 flex items-center gap-3 transition-colors border-l-4 ${selectedThreadId === thread.id ? 'bg-secondary-50 dark:bg-secondary-500/10 border-secondary-500' : 'border-transparent hover:bg-primary-50 dark:hover:bg-primary-800/30'}`}
                            >
                                <div className="relative flex-shrink-0">
                                    <img src={thread.userAvatar} alt={thread.userName} className="w-11 h-11 rounded-full object-cover"/>
                                    {unreadCount > 0 && <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-secondary-500 ring-2 ring-white dark:ring-primary-900"></span>}
                                </div>
                                <div className="flex-grow overflow-hidden">
                                    <div className="flex justify-between items-baseline">
                                        <p className={`font-semibold text-sm truncate text-primary-800 dark:text-primary-200`}>{thread.userName}</p>
                                        {lastMessage && <p className="text-xs text-primary-400 dark:text-primary-500 flex-shrink-0">{formatTimestamp(lastMessage.timestamp, 'threadList')}</p>}
                                    </div>
                                    <p className={`text-xs truncate ${unreadCount > 0 ? 'font-bold text-primary-700 dark:text-primary-300' : 'text-primary-500 dark:text-primary-400'}`}>
                                        {lastMessage ? lastMessage.text : 'Chưa có tin nhắn'}
                                    </p>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>
            
            {/* --- Chat Panel (Main Content) --- */}
            <div className={`
                absolute md:relative top-0 left-0 h-full z-10
                w-full md:w-3/5 lg:w-2/3 flex flex-col bg-primary-50 dark:bg-primary-950
                transition-transform duration-300 ease-in-out
                ${showChatPanel ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`
            }>
                {activeThread ? (
                    <>
                        <div className="p-3 border-b border-primary-200 dark:border-primary-800 flex items-center justify-between gap-3 flex-shrink-0 bg-white dark:bg-primary-900">
                             <div className="flex items-center gap-3">
                                <button onClick={() => setSelectedThreadId(null)} className="md:hidden p-2 rounded-full hover:bg-primary-100 dark:hover:bg-primary-800">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                </button>
                                <img src={activeThread.userAvatar} alt={activeThread.userName} className="w-10 h-10 rounded-full object-cover"/>
                                <div>
                                    <h3 className="font-semibold text-primary-800 dark:text-primary-200">{activeThread.userName}</h3>
                                    <p className="text-xs text-primary-500 dark:text-primary-400">ID: {activeThread.userId}</p>
                                </div>
                            </div>
                            <button onClick={handleLocalDelete} className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors" title="Delete Conversation">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                        <MessageArea messages={activeThread.messages} currentUser={currentUser} otherParticipant={threadUsers.get(activeThread.userId)!} onMessagesEndRef={messagesEndRef} />
                        <ChatInput 
                            messageText={messageText} 
                            setMessageText={setMessageText} 
                            handleSendMessage={handleSendMessage}
                            isSending={isSending}
                            disabled={isSending}
                        />
                    </>
                ) : (
                    <div className="hidden md:flex items-center justify-center h-full text-primary-500 dark:text-primary-400">
                        <p>Chọn một cuộc trò chuyện để bắt đầu.</p>
                    </div>
                )}
            </div>
        </div>
    );
  };

  return (
    <div className="w-full h-screen max-w-7xl mx-auto py-0 sm:py-8 flex flex-col">
         <div className="flex-shrink-0 px-4 sm:px-0 mb-4">
             <button
              onClick={onBack}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-secondary-600 dark:hover:text-secondary-400 flex items-center group"
              aria-label="Back to previous page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1.5 group-hover:-translate-x-0.5 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              Trở về
            </button>
         </div>
      <div className="flex-grow h-full min-h-0">
        {isAdmin ? renderAdminView() : renderUserView()}
      </div>
    </div>
  );
};

export default ChatView;
