

import React, { useState, useMemo, memo } from 'react';
import { Story, Comment, User, Volume, StoryChapter } from '../types';
import LoadingSpinner from './LoadingSpinner';
import CommentSection from './CommentSection';
import RatingModal from './RatingModal';
import { countWordsInContentBlocks, generateFakeStoryStats, toAbsoluteUrl } from '../utils';
import RelativeTime from './RelativeTime';

interface StoryDetailViewProps {
  story: Story;
  selectedVolumeId: string | null;
  onSelectVolume: (volumeId: string | null) => void;
  onBackToMainList: () => void;
  onNavigateToChapter: (volumeId: string, chapterId: string) => void;
  comments: Comment[];
  onAddComment: (storyId: string, text: string, parentId?: string | null) => Promise<void>;
  onToggleCommentLike: (commentId: string) => void;
  onDeleteComment: (commentId: string, storyId: string) => void;
  onTogglePinComment: (commentId: string) => void;
  currentUser: User | null;
  onEditStory: (story: Story) => void;
  onToggleBookmark: (storyId: string) => void;
  onToggleLike: (storyId: string) => void;
  onRateStory: (storyId:string, score: number) => Promise<void>;
  onLoginClick: () => void;
}

const StoryDetailView: React.FC<StoryDetailViewProps> = ({ 
    story, 
    selectedVolumeId,
    onSelectVolume,
    onBackToMainList,
    onNavigateToChapter,
    comments,
    onAddComment,
    onToggleCommentLike,
    onDeleteComment,
    onTogglePinComment,
    currentUser,
    onEditStory,
    onToggleBookmark,
    onToggleLike,
    onRateStory,
    onLoginClick
}) => {
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const selectedVolume = selectedVolumeId ? story.volumes.find(v => v.id === selectedVolumeId) : null;
  const canManageStory = currentUser?.role === 'admin' 
    || (currentUser?.role === 'contractor' && story.creatorId?.id === currentUser.id)
    || (!!currentUser?.allyOf && story.creatorId?.id === currentUser.allyOf.id);

  const fakeStats = useMemo(() => generateFakeStoryStats(story.id), [story.id]);

  const THREE_DAYS_IN_MS = 3 * 24 * 60 * 60 * 1000;
  const isNew = (timestamp?: number) => {
      if (!timestamp) return false;
      return Date.now() - timestamp < THREE_DAYS_IN_MS;
  };

  // --- Calculations for Stats Bar ---
  const wordCount = useMemo(() => {
    return story.volumes.reduce((total, volume) => {
        return total + volume.chapters.reduce((volTotal, chapter) => {
            return volTotal + countWordsInContentBlocks(chapter.contentBlocks);
        }, 0);
    }, 0);
  }, [story.volumes]);

  // Likes
  const isLiked = useMemo(() => !!currentUser && !!story.likedBy?.includes(currentUser.id), [currentUser, story.likedBy]);
  const totalLikes = useMemo(() => (story.likedBy?.length || 0) + fakeStats.likes, [story.likedBy, fakeStats.likes]);

  // Ratings
  const { avgRating, ratingCount, userRating } = useMemo(() => {
    const realRatings = story.ratings || [];
    
    // Base values as per user request: 20 ratings of 4 stars each
    const baseRatingSum = fakeStats.rating * fakeStats.ratingCount; // 4.0 * 20 = 80
    const baseRatingCount = fakeStats.ratingCount; // 20

    // Sum of real user ratings
    const realRatingSum = realRatings.reduce((acc, r) => acc + r.score, 0);
    
    // Combine base and real ratings
    const totalSum = baseRatingSum + realRatingSum;
    const totalCount = baseRatingCount + realRatings.length;

    // Calculate final average rating
    const finalAvgRating = totalCount > 0 ? totalSum / totalCount : fakeStats.rating;

    // Find the current user's individual rating
    const currentUserRating = realRatings.find(r => r.userId === currentUser?.id)?.score || 0;

    return { 
        avgRating: finalAvgRating, 
        ratingCount: totalCount, 
        userRating: currentUserRating 
    };
  }, [story.ratings, currentUser, fakeStats]);
  
  const displayRating = avgRating;
  const displayRatingCount = ratingCount;
  const displayViews = story.views ?? (story.hot ? fakeStats.views * 2 : fakeStats.views);

  const firstChapter = useMemo(() => {
      if (!story.volumes?.[0]?.chapters?.[0]) return null;
      return { volumeId: story.volumes[0].id, chapterId: story.volumes[0].chapters[0].id };
  }, [story.volumes]);

  const latestChapter = useMemo(() => {
      let latest: { chapter: StoryChapter; volumeId: string } | null = null;
      story.volumes.forEach(volume => {
          volume.chapters.forEach(chapter => {
              if (!latest || (chapter.timestamp || 0) > (latest.chapter.timestamp || 0)) {
                  latest = { chapter, volumeId: volume.id };
              }
          });
      });
      return latest ? { volumeId: latest.volumeId, chapterId: latest.chapter.id } : null;
  }, [story.volumes]);
  
  const isBookmarked = useMemo(() => !!currentUser && !!story.bookmarks?.includes(currentUser.id), [currentUser, story.bookmarks]);
  
  // --- Event Handlers for Buttons ---
  const handleFirstChapterClick = () => firstChapter && onNavigateToChapter(firstChapter.volumeId, firstChapter.chapterId);
  const handleLatestChapterClick = () => latestChapter && onNavigateToChapter(latestChapter.volumeId, latestChapter.chapterId);
  const handleBookmarkClick = () => {
    if (!currentUser) { onLoginClick(); return; }
    onToggleBookmark(story.id)
  };
  const handleLikeClick = () => {
    if (!currentUser) { onLoginClick(); return; }
    onToggleLike(story.id);
  }
  const handleOpenRatingModal = () => {
    if (!currentUser) { onLoginClick(); return; }
    setIsRatingModalOpen(true);
  }

  const StatItem = ({ icon, value, label }: { icon: React.ReactNode, value: string | number, label: string }) => (
    <div className="flex flex-col items-center justify-center text-center p-2 flex-1 min-w-[120px]">
        <div className="mb-2">{icon}</div>
        <p className="text-xl font-bold text-primary-900 dark:text-primary-100">{value}</p>
        <p className="text-xs text-primary-500 dark:text-primary-400 uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
  
  const StatButton = ({ icon, value, label, valueClass = '', onClick, disabled = false }: { icon: React.ReactNode, value: string | number, label: string, valueClass?: string, onClick: () => void, disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled} className="flex flex-col items-center justify-center text-center p-2 flex-1 min-w-[120px] group transition-transform duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60">
        <div className={`mb-2 transition-transform duration-200 group-hover:scale-110 ${valueClass}`}>{icon}</div>
        <p className="text-xl font-bold text-primary-900 dark:text-primary-100">{value}</p>
        <p className="text-xs text-primary-500 dark:text-primary-400 uppercase tracking-wider mt-1">{label}</p>
    </button>
  );

  return (
    <>
    <div className="bg-primary-100/95 dark:bg-primary-950/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-6xl w-full my-8 mx-auto relative border border-primary-200/50 dark:border-primary-800/50 transition-colors duration-500">
        <div className="p-4 sm:p-6 md:p-8"> 
            <div className="flex justify-between items-start mb-8">
              <button
                onClick={onBackToMainList}
                className="text-secondary-600 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300 transition-colors flex items-center text-sm group"
                aria-label="Back to all stories"
                >
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-1.5 transition-transform group-hover:-translate-x-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                Back to Stories
                </button>
                {canManageStory && (
                    <button
                        onClick={() => onEditStory(story)}
                        className="bg-accent-500 hover:bg-accent-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 shadow-lg shadow-accent-500/20 hover:shadow-accent-500/40 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-primary-900 flex items-center gap-2"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                           <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                         </svg>
                        Chỉnh sửa truyện
                    </button>
                )}
            </div>
            
            <div className="md:grid md:grid-cols-12 md:gap-8 lg:gap-12">
                <div className="md:col-span-4 lg:col-span-3 mb-8 md:mb-0">
                    <img 
                        src={toAbsoluteUrl(story.coverImageUrl)} 
                        alt={`Cover for ${story.title}`} 
                        className="w-full h-auto object-cover rounded-xl shadow-2xl aspect-[2/3] border-2 border-primary-200 dark:border-primary-800"
                        loading="lazy"
                        onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.onerror = null; 
                            target.src = 'https://picsum.photos/seed/fallbackdetail/400/600?grayscale';
                        }}
                    />
                     <p className={`mt-4 text-center text-lg font-semibold ${
                        story.status === 'Completed' 
                            ? 'text-green-600 dark:text-green-400' 
                            : story.status === 'Dropped' 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-accent-600 dark:text-accent-500'
                      }`}>
                         {story.status}
                    </p>
                     {story.lastUpdated && (
                        <p className="mt-1 text-center text-xs text-primary-500 dark:text-primary-500">
                            Last Updated: {new Date(story.lastUpdated).toLocaleDateString()}
                        </p>
                    )}
                </div>

                <div className="md:col-span-8 lg:col-span-9">
                    <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-900 dark:text-primary-100 mb-2">{story.title}</h1>
                    <div className="space-y-1 text-lg text-primary-600 dark:text-primary-400 mb-4">
                        <p>Tác giả: <span className="font-semibold text-primary-800 dark:text-primary-300">{story.author}</span></p>
                        {story.translator && (
                            <p>Team dịch: <span className="font-semibold text-primary-800 dark:text-primary-300">{story.translator}</span></p>
                        )}
                    </div>
                    
                    <div className="my-6">
                        <h4 className="font-semibold text-primary-700 dark:text-primary-300 mb-2 text-sm uppercase tracking-wider">THỂ LOẠI</h4>
                        <div className="flex flex-wrap gap-2">
                        {story.genres.map((genre) => (
                            <span key={genre} className="bg-primary-200 dark:bg-primary-700 text-primary-700 dark:text-primary-200 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                            {genre}
                            </span>
                        ))}
                        </div>
                    </div>

                    {story.alternativeTitles && story.alternativeTitles.length > 0 && (
                        <div className="my-6">
                            <h4 className="font-semibold text-primary-700 dark:text-primary-300 mb-2 text-sm uppercase tracking-wider">TÊN KHÁC</h4>
                            <div className="flex flex-wrap gap-2">
                            {story.alternativeTitles.map((title, index) => (
                                <span key={index} className="bg-primary-200 dark:bg-primary-700 text-primary-700 dark:text-primary-200 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                                {title}
                                </span>
                            ))}
                            </div>
                        </div>
                    )}

                    <div className="mb-6">
                        <h4 className="font-semibold text-primary-700 dark:text-primary-300 mb-2 text-sm uppercase tracking-wider">Summary</h4>
                        <div className="text-primary-700 dark:text-primary-300 leading-relaxed whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: story.description?.replace(/\n/g, '<br />') || "No summary available." }} />
                    </div>
                </div>
            </div>

            {/* --- Redesigned Stats and Actions Bar --- */}
             <div className="my-8 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-primary-50 via-slate-50 to-purple-50 dark:from-primary-900/50 dark:via-slate-900/60 dark:to-purple-900/50 shadow-inner">
                <div className="flex flex-row flex-wrap justify-around items-center -m-2">
                     <StatItem 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                        value={displayViews.toLocaleString('en-US')}
                        label="Lượt xem"
                     />
                     <StatItem 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                        value={wordCount.toLocaleString('en-US')}
                        label="Từ"
                     />
                     <StatButton
                        onClick={handleLikeClick}
                        value={totalLikes.toLocaleString('en-US')}
                        label="Lượt thích"
                        valueClass={isLiked ? 'text-red-500' : 'text-primary-400'}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                        }
                    />
                     <StatButton
                        onClick={handleOpenRatingModal}
                        value={displayRating.toFixed(1)}
                        label={`${displayRatingCount} lượt`}
                        valueClass="text-amber-500"
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        }
                    />
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 <button onClick={handleFirstChapterClick} disabled={!firstChapter} className="w-full bg-secondary-500 hover:bg-secondary-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-300 shadow-lg shadow-secondary-500/20 hover:shadow-secondary-500/40 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-primary-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm2 1a1 1 0 00-1 1v6a1 1 0 001 1h8a1 1 0 001-1V7a1 1 0 00-1-1H5z" clipRule="evenodd" /></svg>
                    Đọc từ đầu
                </button>
                <button onClick={handleLatestChapterClick} disabled={!latestChapter} className="w-full bg-primary-200 dark:bg-primary-700 hover:bg-primary-300 dark:hover:bg-primary-600 text-primary-800 dark:text-primary-100 font-semibold py-3 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-primary-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm14 0H4v10h12V5zM8 7a1 1 0 100 2h4a1 1 0 100-2H8z" clipRule="evenodd" /></svg>
                    Đọc mới nhất
                </button>
                 <button onClick={handleBookmarkClick} className={`w-full font-semibold py-3 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-primary-900 flex items-center justify-center gap-2 ${isBookmarked ? 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500' : 'bg-primary-200 dark:bg-primary-700 hover:bg-primary-300 dark:hover:bg-primary-600 text-primary-800 dark:text-primary-100 focus:ring-primary-400'}`}>
                    {isBookmarked ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                    )}
                    {isBookmarked ? 'Đã theo dõi' : 'Theo dõi'}
                </button>
            </div>

             <div className="mt-8">
                <h3 className="font-serif text-2xl font-bold text-primary-800 dark:text-primary-200 mb-4">Chương truyện</h3>
                <div className="space-y-4">
                    {story.volumes.map((volume) => (
                        <div key={volume.id} className="bg-primary-50 dark:bg-primary-800/60 p-4 rounded-xl shadow-md border border-primary-200/50 dark:border-primary-700/50">
                            <h4 className="font-semibold text-lg text-primary-800 dark:text-primary-200 mb-3 flex items-center gap-2">
                                {volume.title}
                                {isNew(volume.timestamp) && (
                                    <span className="text-xs font-bold text-white bg-red-500 px-2 py-0.5 rounded-full animate-pulse">NEW</span>
                                )}
                            </h4>
                            <ul className="space-y-2">
                                {volume.chapters.length > 0 ? (
                                    volume.chapters.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)).map(chapter => (
                                        <li key={chapter.id}>
                                            <button
                                                onClick={() => onNavigateToChapter(volume.id, chapter.id)}
                                                className="w-full text-left p-3 rounded-lg flex justify-between items-center group transition-colors duration-200 hover:bg-white/70 dark:hover:bg-primary-800"
                                            >
                                                <span className="text-primary-700 dark:text-primary-200 group-hover:text-secondary-600 dark:group-hover:text-secondary-400 flex items-center gap-2">
                                                    {chapter.title}
                                                    {isNew(chapter.timestamp) && (
                                                        <span className="text-xs font-bold text-white bg-red-500 px-2 py-0.5 rounded-full animate-pulse">NEW</span>
                                                    )}
                                                </span>
                                                {chapter.timestamp && (
                                                    <RelativeTime timestamp={chapter.timestamp} className="text-xs text-primary-500 dark:text-primary-400 flex-shrink-0"/>
                                                )}
                                            </button>
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-sm text-primary-500 dark:text-primary-400 px-3">Tập này chưa có chương nào.</li>
                                )}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-12">
                <CommentSection
                    comments={comments}
                    currentUser={currentUser}
                    onAddComment={(text, parentId) => onAddComment(story.id, text, parentId)}
                    onDeleteComment={(commentId) => onDeleteComment(commentId, story.id)}
                    onToggleCommentLike={onToggleCommentLike}
                    onTogglePinComment={onTogglePinComment}
                    onLoginClick={onLoginClick}
                    sectionTitle="Bình luận"
                    storyCreatorId={story.creatorId?.id}
                />
            </div>
        </div>
    </div>
    {isRatingModalOpen && (
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onSubmit={(score) => onRateStory(story.id, score)}
        storyTitle={story.title}
        currentRating={userRating}
      />
    )}
    </>
  );
};

export default memo(StoryDetailView);
