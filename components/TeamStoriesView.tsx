

import React from 'react';
import { Story, User } from '../types';
import MyStoriesView from './MyStoriesView';

interface TeamStoriesViewProps {
  stories: Story[];
  currentUser: User;
  onEditStory: (story: Story) => void;
  onDeleteStory: (storyId: string) => void;
  onBack: () => void;
  onSelectStory: (story: Story) => void;
}

const TeamStoriesView: React.FC<TeamStoriesViewProps> = (props) => {
  // Render the generic management view with the 'team' type
  return <MyStoriesView {...props} viewType="team" />;
};

export default TeamStoriesView;
