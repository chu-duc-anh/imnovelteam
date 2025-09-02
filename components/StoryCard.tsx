


import React, { useMemo } from 'react';
import { Story, User } from '../types';
import RelativeTime from './RelativeTime';
import { generateFakeStoryStats, toAbsoluteUrl } from '../utils';

interface StoryCardProps {
  story: Story;
  onSelectStory: (story: Story) => void;
  currentUser?: User | null;
  onEditStory?: (story: Story) => void;
  onDeleteStory?: (storyId: string) => void;
  size?: 'small' | 'normal';
  layout?: 'grid' | 'list';
}

const isNew = (timestamp?: number) => {
    if (!timestamp) return false;
    const THREE_DAYS_IN_MS = 3 * 24 * 60 * 60 * 1000;
    return Date.now() - timestamp < THREE_DAYS_IN_MS;
};

const StoryCard: React.FC<StoryCardProps> = ({ 
  story, 
  onSelectStory, 
  currentUser, 
  onEditStory, 
  onDeleteStory,
  size = 'normal',
  layout = 'grid'
}) => {
  const canManageStory = currentUser?.role === 'admin' 
    || (currentUser?.role === 'contractor' && story.creatorId?.id === currentUser.id)
    || (!!currentUser?.allyOf && story.creatorId?.id === currentUser.allyOf.id);

  if (layout === 'list') {
    const latestChapters = (story.volumes || [])
      .flatMap(volume => (volume.chapters || []).map(chapter => ({ ...chapter, volumeId: volume.id })))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, 3);
      
    const statusTextMap = {
      Ongoing: 'ĐANG TIẾN HÀNH',
      Completed: 'ĐÃ HOÀN THÀNH',
      Dropped: 'ĐÃ DROP',
    };
  
    const statusColorMap = {
      Ongoing: 'bg-green-600',
      Completed: 'bg-blue-600',
      Dropped: 'bg-red-600',
    };

    return (
      <article className="bg-primary-50 dark:bg-primary-900 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out group border border-primary-200 dark:border-primary-800">
        <header className="p-3 sm:p-4 bg-white dark:bg-primary-800/50 border-b border-primary-200 dark:border-primary-800 flex justify-between items-center">
          <h3 
            id={`story-title-${story.id}`} 
            onClick={() => onSelectStory(story)}
            className="font-serif text-lg sm:text-xl font-bold text-primary-800 dark:text-primary-100 hover:text-secondary-600 dark:hover:text-secondary-400 transition-colors cursor-pointer truncate"
          >
            {story.title}
          </h3>
          {canManageStory && onEditStory && onDeleteStory && (
            <div className="flex-shrink-0 flex items-center space-x-2">
              <button
                onClick={(e) => { e.stopPropagation(); onEditStory(story); }}
                className="p-2 rounded-lg transition-colors text-primary-500 hover:bg-accent-100 hover:text-accent-700 dark:hover:bg-primary-700"
                aria-label={`Edit ${story.title}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteStory(story.id); }}
                className="p-2 rounded-lg transition-colors text-red-500 hover:bg-red-100 dark:hover:bg-primary-700"
                aria-label={`Delete ${story.title}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
              </button>
            </div>
          )}
        </header>
        <div className="p-3 sm:p-4 flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-48 flex-shrink-0">
            <div className="relative cursor-pointer aspect-[3/4]" onClick={() => onSelectStory(story)}>
              <img 
                src={toAbsoluteUrl(story.coverImageUrl)} 
                alt={`Cover for ${story.title}`}
                className="absolute inset-0 w-full h-full object-cover rounded-md shadow-lg" 
                loading="lazy"
              />
              <div className={`absolute bottom-0 left-0 right-0 p-1.5 text-center text-xs font-bold text-white rounded-b-md ${statusColorMap[story.status || 'Ongoing']}`}>
                {statusTextMap[story.status || 'Ongoing']}
              </div>
            </div>
          </div>

          <div className="flex flex-col flex-grow">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(story.genres || []).slice(0, 5).map((genre) => (
                <span key={genre} className="text-xs bg-primary-200 dark:bg-primary-700 text-primary-700 dark:text-primary-200 px-2 py-1 rounded-full font-medium">
                  {genre}
                </span>
              ))}
            </div>
            <div className="text-sm text-primary-500 dark:text-primary-400 my-2 space-y-1">
                <p className="truncate"><strong>Tác giả:</strong> {story.author}</p>
                {story.translator && <p className="truncate"><strong>Team dịch:</strong> {story.translator}</p>}
                {story.country && <p className="truncate"><strong>Quốc gia:</strong> {story.country}</p>}
            </div>
            <p className="text-sm text-primary-600 dark:text-primary-300 line-clamp-2 mb-2 flex-grow">{story.description}</p>
            <div className="mt-auto">
              <button onClick={() => onSelectStory(story)} className="text-sm font-semibold text-secondary-600 dark:text-secondary-400 hover:underline">Đọc tiếp...</button>
              <hr className="my-2 border-primary-200 dark:border-primary-700" />
              <ul className="space-y-1.5 text-sm">
                {latestChapters.length > 0 ? latestChapters.map(ch => (
                  <li key={ch.id} className="flex justify-between items-center gap-4">
                    <button onClick={() => onSelectStory(story)} className="flex items-center gap-2 text-primary-700 dark:text-primary-200 hover:text-secondary-500 dark:hover:text-secondary-400 transition-colors text-left truncate">
                      <span className="truncate">{ch.title}</span>
                      {isNew(ch.timestamp) && (
                        <span className="flex-shrink-0 text-xs font-bold text-white bg-red-500 px-1.5 py-0.5 rounded-full animate-pulse">MỚI</span>
                      )}
                    </button>
                    <RelativeTime 
                        timestamp={ch.timestamp} 
                        className="text-xs text-primary-500 dark:text-primary-400 flex-shrink-0"
                    />
                  </li>
                )) : (
                  <li className="text-xs text-primary-500 dark:text-primary-400">Chưa có chương nào.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // --- GRID LAYOUT (existing logic) ---
  const fakeStats = useMemo(() => generateFakeStoryStats(story.id), [story.id]);
  const displayRating = useMemo(() => {
    const realRatings = story.ratings || [];
    
    // Base values from fake stats
    const baseRatingSum = fakeStats.rating * fakeStats.ratingCount;
    const baseRatingCount = fakeStats.ratingCount;

    // Sum of real ratings
    const realRatingSum = realRatings.reduce((acc, r) => acc + r.score, 0);
    
    // Total sum and count
    const totalSum = baseRatingSum + realRatingSum;
    const totalCount = baseRatingCount + realRatings.length;

    // Calculate final average rating
    return totalCount > 0 ? totalSum / totalCount : fakeStats.rating;
  }, [story.ratings, fakeStats]);

  const cardBaseClasses = "rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out flex flex-col group relative";
  const cardThemeClasses = "bg-white dark:bg-primary-800/80 backdrop-blur-sm border border-primary-200/50 dark:border-primary-700/50 hover:shadow-2xl hover:border-primary-300 dark:hover:border-primary-600 hover:-translate-y-1";
  
  const cardClasses = size === 'small' 
    ? `${cardBaseClasses} ${cardThemeClasses} w-64 flex-shrink-0`
    : `${cardBaseClasses} ${cardThemeClasses}`;
  
  const imgHeightClass = size === 'small' ? 'h-64' : 'h-80';
  const titleSizeClass = size === 'small' ? 'text-lg' : 'text-xl';
  const descriptionLineClamp = size === 'small' ? 'line-clamp-2' : 'line-clamp-3';

  return (
    <article
      className={cardClasses}
      role="article"
      aria-labelledby={`story-title-${story.id}`}
    >
      <div 
        className="relative cursor-pointer overflow-hidden"
        onClick={() => onSelectStory(story)}
        onKeyPress={(e) => e.key === 'Enter' && onSelectStory(story)}
        tabIndex={0}
        aria-label={`View details for ${story.title}`}
      >
        <img 
            src={toAbsoluteUrl(story.coverImageUrl)} 
            alt={`Cover for ${story.title}`} 
            className={`w-full ${imgHeightClass} object-cover transition-transform duration-500 ease-in-out group-hover:scale-110`} 
            loading="lazy"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.onerror = null; 
              target.src = 'https://picsum.photos/seed/fallback/400/600?grayscale';
            }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        {(story.isRecent || story.hot) && (
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {story.isRecent && (
                <span className="bg-secondary-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">NEW</span>
            )}
            {story.hot && (
                <span className="bg-accent-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg animate-pulse">HOT</span>
            )}
          </div>
        )}
         {displayRating && (
            <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-accent-400">
                    <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.382c-.836.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.3-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
                </svg>
                {displayRating.toFixed(1)}
            </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 id={`story-title-${story.id}`} className={`font-serif ${titleSizeClass} font-bold text-primary-800 dark:text-primary-100 mb-1 group-hover:text-secondary-600 dark:group-hover:text-secondary-400 transition-colors`}>{story.title}</h3>
        <div className="text-sm text-primary-500 dark:text-primary-400 mb-3">
            <p className="truncate">Tác giả: {story.author}</p>
            {story.translator && (
                <p className="truncate">Team dịch: {story.translator}</p>
            )}
        </div>
        {size === 'normal' && (
          <div className="mb-4 flex flex-wrap gap-2">
            {(story.genres || []).slice(0, 3).map((genre) => (
              <span key={genre} className="text-xs bg-primary-200 dark:bg-primary-700 text-primary-700 dark:text-primary-200 px-2.5 py-1 rounded-full font-medium">
                {genre}
              </span>
            ))}
          </div>
        )}
        <p className={`text-sm text-primary-600 dark:text-primary-300 ${descriptionLineClamp} flex-grow mb-4`}>{story.description}</p>
        
         <div className="mt-auto pt-4 border-t border-primary-200 dark:border-primary-700">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => onSelectStory(story)}
              className="w-full bg-secondary-500 hover:bg-secondary-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 text-sm shadow-lg shadow-secondary-500/20 hover:shadow-secondary-500/40 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-primary-800"
            >
              Đọc truyện
            </button>
            {canManageStory && onEditStory && onDeleteStory && size === 'normal' && (
              <div className="ml-2 flex space-x-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onEditStory(story); }}
                  className="p-2 rounded-lg transition-colors text-primary-500 hover:bg-accent-100 hover:text-accent-700 dark:hover:bg-primary-700"
                  aria-label={`Edit ${story.title}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteStory(story.id); }}
                  className="p-2 rounded-lg transition-colors text-red-500 hover:bg-red-100 dark:hover:bg-primary-700"
                  aria-label={`Delete ${story.title}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default StoryCard;
