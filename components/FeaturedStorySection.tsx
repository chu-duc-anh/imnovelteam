

import React, { memo } from 'react';
import { Story, User } from '../types'; // Imported User type
import StoryCard from './StoryCard';

interface FeaturedStorySectionProps {
  stories: Story[];
  onSelectStory: (story: Story) => void;
  currentUser?: User | null; // Pass down for StoryCard admin controls, if needed in this context
}

const FeaturedStorySection: React.FC<FeaturedStorySectionProps> = ({ stories, onSelectStory, currentUser }) => {
  if (!stories || stories.length === 0) {
    return (
        <div className="text-center text-primary-600 dark:text-primary-400 py-16 px-6 bg-white/50 dark:bg-primary-900/50 rounded-xl">
            <h3 className="font-serif text-2xl font-bold mb-2">Không có truyện nào</h3>
            <p>Hiện không có truyện nào trong mục này.</p>
        </div>
    );
  }

  return (
    <section>
      <div className="flex overflow-x-auto space-x-6 pb-6 -mx-4 px-4">
        {stories.map(story => (
          <StoryCard 
            key={story.id} 
            story={story} 
            onSelectStory={onSelectStory} 
            currentUser={currentUser}
            size="small"
          />
        ))}
        <div className="flex-shrink-0 w-2"></div>
      </div>
    </section>
  );
};

export default memo(FeaturedStorySection);
