import React from 'react';
import { Story, User } from '../types';
import StoryCard from './StoryCard';

interface BookmarkedStoriesViewProps {
  stories: Story[];
  onBack: () => void;
  onSelectStory: (story: Story) => void;
}

const BookmarkedStoriesView: React.FC<BookmarkedStoriesViewProps> = ({
  stories,
  onBack,
  onSelectStory
}) => {
  return (
    <div className="max-w-7xl mx-auto my-8 p-4 sm:p-6 md:p-8 bg-primary-100/95 dark:bg-primary-950/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-primary-200/50 dark:border-primary-800/50">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 border-b border-primary-200/80 dark:border-primary-800/80 pb-6">
        <div>
            <button
                onClick={onBack}
                className="text-sm text-secondary-600 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300 flex items-center group mb-2"
                aria-label="Back to previous page"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                Back
            </button>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary-800 dark:text-primary-100 text-center sm:text-left">
                Truyện đã theo dõi
            </h1>
        </div>
      </div>

       {stories.length === 0 ? (
         <div className="text-center text-primary-600 dark:text-primary-400 py-16 px-6 bg-white/50 dark:bg-primary-900/50 rounded-xl">
            <h3 className="font-serif text-2xl font-bold mb-2">Chưa có truyện nào được theo dõi</h3>
            <p>Bạn có thể theo dõi truyện từ trang chi tiết của chúng.</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {stories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              onSelectStory={onSelectStory}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BookmarkedStoriesView;
