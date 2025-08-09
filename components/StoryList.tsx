import React from 'react';
import { Story, User } from '../types';
import StoryCard from './StoryCard';
import PaginationControls from './PaginationControls';

interface StoryListProps {
  stories: Story[];
  currentUser: User | null;
  onSelectStory: (story: Story) => void;
  onEditStory?: (story: Story) => void;
  onDeleteStory?: (storyId: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const StoryList: React.FC<StoryListProps> = ({ 
  stories, 
  currentUser, 
  onSelectStory, 
  onEditStory, 
  onDeleteStory,
  currentPage,
  totalPages,
  onPageChange
}) => {

  return (
    <div className="pt-0">
      {stories.length === 0 ? (
         <div className="text-center text-primary-600 dark:text-primary-400 py-16 px-6 bg-white/50 dark:bg-primary-900/50 rounded-xl">
            <h3 className="font-serif text-2xl font-bold mb-2">No Stories Found</h3>
            <p>No stories match your current filters. Try adjusting your search or genre selection.</p>
         </div>
      ) : (
        <div className="space-y-6 lg:space-y-8">
          {stories.map((story) => (
            <StoryCard 
              key={story.id} 
              story={story} 
              onSelectStory={onSelectStory}
              currentUser={currentUser}
              onEditStory={onEditStory}
              onDeleteStory={onDeleteStory}
              layout="list"
            />
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

export default StoryList;