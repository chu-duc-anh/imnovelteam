

import React from 'react';
import { Story, User } from '../types';
import StoryCard from './StoryCard';

interface TeamStoriesViewProps {
  stories: Story[];
  currentUser: User;
  onEditStory: (story: Story) => void;
  onDeleteStory: (storyId: string) => void;
  onBack: () => void;
  onSelectStory: (story: Story) => void;
}

const TeamStoriesView: React.FC<TeamStoriesViewProps> = ({
  stories,
  currentUser,
  onEditStory,
  onDeleteStory,
  onBack,
  onSelectStory
}) => {
  const title = "Giao diện truyện của team";

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
                {title}
            </h1>
        </div>
        <p className="mt-4 sm:mt-0 text-sm text-primary-500 dark:text-primary-400 text-center sm:text-right max-w-xs">
            Bạn có thể chỉnh sửa và quản lý các tập, chương của truyện trong team tại đây.
        </p>
      </div>

       {stories.length === 0 ? (
         <div className="text-center text-primary-600 dark:text-primary-400 py-16 px-6 bg-white/50 dark:bg-primary-900/50 rounded-xl">
            <h3 className="font-serif text-2xl font-bold mb-2">Không tìm thấy truyện nào</h3>
            <p>Nhà thầu của bạn chưa tạo truyện nào, hoặc bạn chưa được chỉ định làm đồng minh.</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {stories.map((story) => (
            <StoryCard 
              key={story.id} 
              story={story} 
              onSelectStory={onSelectStory}
              currentUser={currentUser}
              onEditStory={onEditStory}
              onDeleteStory={onDeleteStory}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamStoriesView;
