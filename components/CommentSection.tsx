

import React, { useState, useEffect, useRef, memo } from 'react';
import { Comment, User } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { DEFAULT_AVATAR_URL } from '../constants';

interface CommentSectionProps {
  comments: Comment[];
  currentUser: User | null;
  onAddComment: (text: string, parentId: string | null) => Promise<void>;
  onDeleteComment: (commentId: string) => void;
  onToggleCommentLike: (commentId: string) => void;
  onTogglePinComment: (commentId: string) => void;
  onLoginClick: () => void;
  sectionTitle: string;
  storyCreatorId: string | undefined;
}

const CommentSection: React.FC<CommentSectionProps> = ({ 
    comments,
    currentUser, 
    onAddComment, 
    onDeleteComment,
    onToggleCommentLike, 
    onTogglePinComment,
    onLoginClick, 
    sectionTitle,
    storyCreatorId
}) => {
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const isCurrentUserArchangel = currentUser?.race === 'Tổng lãnh thiên thần';
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (openMenuId && menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setOpenMenuId(null);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  const handleCommentSubmit = async (e: React.FormEvent, parentId: string | null = null, text: string, setText: React.Dispatch<React.SetStateAction<string>>) => {
    e.preventDefault();
    if (!text.trim()) {
      setCommentError(parentId ? "Reply cannot be empty." : "Comment cannot be empty.");
      return;
    }
    if (!currentUser) {
      if(onLoginClick) onLoginClick();
      else setCommentError("You must be logged in to comment.");
      return;
    }
    
    setIsSubmittingComment(true);
    setCommentError(null);
    try {
      await onAddComment(text, parentId);
      setText('');
      if (parentId) {
        setReplyingTo(null);
      }
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : "Failed to post comment.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isSubmittingComment) {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if (form) {
            form.requestSubmit();
        }
    }
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const formInputClasses = "w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none";
  
  const renderCommentTree = (parentId: string | null) => {
    let commentList = comments.filter(comment => comment.parentId === parentId);

    // Sort by pinned status first, then by timestamp
    commentList.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        
        if (parentId === null) {
            // Top-level comments: newest first
            return b.timestamp - a.timestamp;
        } else {
            // Replies: oldest first for chronological order
            return a.timestamp - b.timestamp;
        }
    });

    if (commentList.length === 0) {
      return parentId ? null : <p className="text-gray-500 dark:text-gray-400">No comments yet. Be the first to comment!</p>;
    }

    return (
      <ul className={`space-y-4 ${parentId ? 'pl-6 md:pl-10 mt-4 border-l-2 border-gray-200 dark:border-gray-700' : ''}`}>
        {commentList.map(comment => {
          if (!comment.userId) return null; // Add a guard for potentially malformed data
          const isLiked = currentUser && comment.likes.includes(currentUser.id);
          const isReplying = replyingTo === comment.id;
          const isArchangel = comment.userId.race === 'Tổng lãnh thiên thần';
          const username = comment.userId.name || comment.userId.username;
          const showTransBadge = (comment.userId.role === 'contractor' && comment.userId.id === storyCreatorId) || (comment.userId.allyOf?.id === storyCreatorId);

          return (
            <li key={comment.id} className="flex items-start space-x-3">
              <img 
                src={comment.userId.picture || DEFAULT_AVATAR_URL} 
                alt={`${username}'s avatar`}
                className={`w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-gray-200 dark:border-gray-600 ${isArchangel ? 'archangel-avatar-halo' : ''}`}
              />
              <div className={`flex-grow p-3 rounded-lg ${comment.isPinned ? 'bg-primary-50 dark:bg-primary-900/40 border border-primary-200 dark:border-primary-500/50' : 'bg-gray-100 dark:bg-gray-700'}`}>
                {comment.isPinned && (
                    <div className="flex items-center text-xs font-semibold text-primary-600 dark:text-primary-300 mb-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" transform="rotate(45 10 10)" />
                         </svg>
                        Pinned Comment
                    </div>
                )}
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center space-x-2">
                    <span className={`font-semibold text-sm ${isArchangel ? 'archangel-text-gradient' : 'text-primary-600 dark:text-primary-300'}`}>{username}</span>
                    {comment.userId.race && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isArchangel ? 'archangel-race-badge' : 'text-white bg-secondary-500 dark:bg-secondary-600'}`}>
                            {comment.userId.race}
                        </span>
                    )}
                    {showTransBadge && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500 dark:bg-blue-600 text-white">
                            trans
                        </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(comment.timestamp)}</span>
                </div>
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap text-sm">{comment.text}</p>
                <div className="mt-2 flex items-center space-x-4 text-xs">
                  <button
                    onClick={() => {
                      if (!currentUser && onLoginClick) { onLoginClick(); return; }
                      onToggleCommentLike(comment.id)
                    }}
                    disabled={!currentUser}
                    className={`flex items-center font-medium transition-colors ${
                      isLiked 
                        ? 'text-secondary-500 dark:text-secondary-400' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    aria-label={`Like comment, currently ${comment.likes.length} likes`}
                  >
                    {isLiked ? (
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                       </svg>
                    ) : (
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                       </svg>
                    )}
                    <span>{comment.likes.length > 0 ? comment.likes.length : ''} Like</span>
                  </button>
                  <button
                    onClick={() => {
                      if (!currentUser && onLoginClick) {
                          onLoginClick();
                          return;
                      }
                      setReplyingTo(isReplying ? null : comment.id);
                      setReplyText(''); 
                    }}
                    disabled={!currentUser}
                    className="flex items-center font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Reply to comment"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Reply</span>
                  </button>
                  
                  <div className="flex-grow"></div>

                  {/* Combined admin and user actions menu */}
                  {(currentUser?.role === 'admin' || currentUser?.id === comment.userId.id) && (
                      <div className="relative" ref={openMenuId === comment.id ? menuRef : null}>
                          <button
                            onClick={() => setOpenMenuId(openMenuId === comment.id ? null : comment.id)}
                            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            aria-label="Comment options"
                            aria-haspopup="true"
                            aria-expanded={openMenuId === comment.id}
                          >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                              </svg>
                          </button>
                          {openMenuId === comment.id && (
                              <div className="absolute right-0 bottom-full mb-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-10 p-1">
                                  <ul>
                                      {/* Delete is available for both admin and owner */}
                                      <li>
                                          <button
                                              onClick={() => {
                                                  onDeleteComment(comment.id);
                                                  setOpenMenuId(null);
                                              }}
                                              className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                                          >
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                              </svg>
                                              Xóa bình luận
                                          </button>
                                      </li>
                                      {/* Pin is only available for admin */}
                                      {currentUser.role === 'admin' && (
                                        <li>
                                            <button
                                                onClick={() => {
                                                    onTogglePinComment(comment.id);
                                                    setOpenMenuId(null);
                                                }}
                                                className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" transform="rotate(45 10 10)" /></svg>
                                                {comment.isPinned ? 'Bỏ ghim bình luận' : 'Ghim bình luận'}
                                            </button>
                                        </li>
                                      )}
                                  </ul>
                              </div>
                          )}
                      </div>
                  )}
                </div>
                {isReplying && currentUser && (
                  <form onSubmit={(e) => handleCommentSubmit(e, comment.id, replyText, setReplyText)} className="mt-3 flex items-start space-x-3">
                    <img src={currentUser.picture || DEFAULT_AVATAR_URL} alt="Your avatar" className={`w-8 h-8 rounded-full object-cover flex-shrink-0 border-2 border-gray-200 dark:border-gray-600 ${isCurrentUserArchangel ? 'archangel-avatar-halo' : ''}`}/>
                    <div className="flex-grow">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={`Trả lời ${username}... (Enter để gửi, Shift+Enter xuống dòng)`}
                        rows={2}
                        className={`${formInputClasses} text-sm`}
                        autoFocus
                      />
                      <div className="flex justify-end space-x-2 mt-2">
                        <button type="button" onClick={() => setReplyingTo(null)} className="px-3 py-1 bg-gray-500 text-white text-xs font-medium rounded-md hover:bg-gray-400">Cancel</button>
                        <button type="submit" disabled={isSubmittingComment} className="px-3 py-1 bg-primary-500 text-white text-xs font-medium rounded-md hover:bg-primary-600 disabled:opacity-50">
                          {isSubmittingComment && replyingTo === comment.id ? <LoadingSpinner size="sm" /> : 'Post Reply'}
                        </button>
                      </div>
                    </div>
                  </form>
                )}
                {renderCommentTree(comment.id)}
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className={sectionTitle ? "mt-8 border-t border-gray-200 dark:border-gray-700 pt-6" : ""}>
        {sectionTitle && <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">{sectionTitle} ({comments.length})</h4>}
        {currentUser ? (
            <form onSubmit={(e) => handleCommentSubmit(e, null, newCommentText, setNewCommentText)} className="mb-6 flex items-start space-x-3">
                <img 
                    src={currentUser.picture || DEFAULT_AVATAR_URL} 
                    alt="Your avatar"
                    className={`w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-gray-200 dark:border-gray-600 ${isCurrentUserArchangel ? 'archangel-avatar-halo' : ''}`}
                />
                <div className="flex-grow">
                    <textarea
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Viết bình luận của bạn... (Enter để gửi, Shift+Enter để xuống dòng)"
                    rows={3}
                    className={formInputClasses}
                    />
                    {commentError && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{commentError}</p>}
                    <button
                    type="submit"
                    disabled={isSubmittingComment}
                    className="mt-2 px-4 py-2 bg-primary-500 dark:bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-600 dark:hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                    {isSubmittingComment && !replyingTo ? <LoadingSpinner size="sm" /> : 'Post Comment'}
                    </button>
                </div>
            </form>
        ) : (
            <p className="text-gray-500 dark:text-gray-400 mb-4">
                Please <button onClick={onLoginClick} className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">log in</button> to post a comment. 
            </p>
        )}
        {renderCommentTree(null)}
    </div>
  )
};

export default memo(CommentSection);
