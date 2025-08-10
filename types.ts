
export interface SimplifiedStory {
  id: string;
  title: string;
  coverImageUrl: string;
  author: string;
  translator?: string;
}

export interface ContentBlockText {
  type: 'text';
  id: string; // For React keys and editing
  value: string;
}
export interface ContentBlockImage {
  type: 'image';
  id:string; // For React keys and editing
  value: string; // URL
  alt?: string;
}
export type ContentBlock = ContentBlockText | ContentBlockImage;

export interface StoryChapter {
  id:string;
  title: string;
  contentBlocks: ContentBlock[]; // Changed from optional to required
  timestamp?: number; // For sorting and displaying recent chapters
}

export interface Volume {
  id: string;
  title: string;
  coverImageUrl?: string; // Optional cover for the volume
  chapters: StoryChapter[];
  timestamp?: number; // For checking "new" status
}

export interface Story {
  id: string;
  creatorId: { id: string; username: string; }; // ID of the user who created the story
  title: string;
  author: string;
  translator?: string; // Tên nhà dịch (Team dịch)
  alternativeTitles?: string[];
  coverImageUrl: string;
  genres: string[];
  description: string; // This will be AI-generated or enhanced
  volumes: Volume[]; // Changed from chapters to volumes
  rating?: number; // e.g., 4.5
  status?: 'Ongoing' | 'Completed' | 'Dropped';
  isRecent?: boolean;
  hot?: boolean;
  lastUpdated?: number; // Unix timestamp for when the story was last updated or created
  views?: number;
  ratingCount?: number;
  bookmarks?: string[];
  likedBy?: string[];
  ratings?: { userId: string; score: number }[];
}

export interface User {
  id: string;
  username: string; // For display; for Google users, can be derived from name or email
  role: 'user' | 'admin' | 'contractor';
  race?: string; // e.g., Nhân tộc, Thú tộc, Thiên thần
  passwordHash?: string; // Optional, as Google users won't have this
  googleId?: string; // Google User ID (sub claim)
  email?: string; // User's email, verified by Google
  name?: string; // User's full name from Google
  picture?: string; // URL to user's Google profile picture
  allyOf?: { id: string; username: string; } | null; // Contractor this user is an ally of
}

export interface Comment {
  id: string;
  storyId: string;
  chapterId?: string | null; // For chapter-specific comments
  userId: User; // Changed from string to User object
  text: string;
  timestamp: number; // Unix timestamp
  likes: string[]; // Array of user IDs who liked the comment
  parentId: string | null; // ID of the comment this is a reply to
  isPinned?: boolean; // For pinning comments
}

export interface ChatMessage {
  id: string;
  senderId: string | { id: string; name?: string; username: string; picture?: string; }; 
  receiverId: string;
  text: string;
  timestamp: number;
  isRead: boolean;
}

export interface ChatThread {
  id: string; // Same as the user's ID
  userId: string;
  userName: string;
  userAvatar: string;
  messages: ChatMessage[];
  lastMessageTimestamp: number;
}

export interface LeaderboardUser extends User {
  totalScore: number;
}

export interface SiteSetting {
  id: string;
  key: 'backgroundLight' | 'backgroundDark' | 'authBackground' | 'backgroundMusic';
  value: string; // URL or data URL
  mediaType: 'image' | 'video' | 'audio';
}
