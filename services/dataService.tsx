

import { api } from './api';
import { Story, Comment, Volume, ContentBlock, SiteSetting, SimplifiedStory } from '../types';

interface GetStoriesParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'all' | 'Ongoing' | 'Completed' | 'Dropped';
    genresInclude?: string[];
    genresExclude?: string[];
    creatorId?: string;
}

interface PaginatedStoriesResponse {
    stories: Story[];
    page: number;
    pages: number;
    total: number;
}


export const dataService = {
  // === Stories ===
  async getStories(params: GetStoriesParams = {}): Promise<PaginatedStoriesResponse> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.search) query.append('search', params.search);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.genresInclude?.length) query.append('genresInclude', params.genresInclude.join(','));
    if (params.genresExclude?.length) query.append('genresExclude', params.genresExclude.join(','));
    if (params.creatorId) query.append('creatorId', params.creatorId);

    const queryString = query.toString();
    return api.get<PaginatedStoriesResponse>(`/stories?${queryString}`);
  },

  async getStoryById(id: string): Promise<Story> {
    return api.get<Story>(`/stories/${id}`);
  },

  async searchStories(term: string): Promise<SimplifiedStory[]> {
    if (!term.trim()) return [];
    return api.get<SimplifiedStory[]>(`/stories/search?term=${encodeURIComponent(term)}`);
  },

  async getHotStories(): Promise<Story[]> {
    return api.get<Story[]>('/stories/hot');
  },

  async getRecentStories(): Promise<Story[]> {
    return api.get<Story[]>('/stories/recent');
  },
  
  async checkStoryTitleAvailability(title: string, excludeId?: string): Promise<boolean> {
      const payload: { title: string; excludeId?: string } = { title };
      if (excludeId) {
          payload.excludeId = excludeId;
      }
      const { available } = await api.post<{ available: boolean }>('/stories/check-title', payload);
      return available;
  },
  
  async saveStory(storyData: Story): Promise<Story> {
    if (storyData.id) {
        // Editing existing story
        return api.put<Story>(`/stories/${storyData.id}`, storyData);
    } else {
        // Creating new story
        return api.post<Story>('/stories', storyData);
    }
  },
  
  async deleteStory(storyId: string): Promise<void> {
    await api.delete<void>(`/stories/${storyId}`);
  },

  async toggleBookmark(storyId: string): Promise<Story> {
    return api.put<Story>(`/stories/${storyId}/bookmark`, {});
  },

  async toggleStoryLike(storyId: string): Promise<Story> {
    return api.put<Story>(`/stories/${storyId}/like`, {});
  },

  async submitStoryRating(storyId: string, score: number): Promise<Story> {
    return api.post<Story>(`/stories/${storyId}/rate`, { score });
  },

  // This function is no longer needed as the full story object is saved.
  // Kept for compatibility in case any component still uses it, but it should be deprecated.
  async updateStoryDescription(storyId: string, description: string): Promise<Story> {
      console.warn("updateStoryDescription is deprecated. Use saveStory instead.");
      return api.put<Story>(`/stories/${storyId}`, { description });
  },

   // This is also better handled by saveStory, but kept for potential specific use cases.
   async saveChapterContentBlocks(storyId: string, volumeId: string, chapterId: string, newContentBlocks: ContentBlock[]): Promise<Story> {
    return api.put<Story>(`/stories/${storyId}/volumes/${volumeId}/chapters/${chapterId}/content`, { contentBlocks: newContentBlocks });
   },

  // === Comments ===
  async getComments(storyId?: string, chapterId?: string): Promise<Comment[]> {
    let query = '';
    if (storyId) {
      query = `?storyId=${storyId}`;
      if (chapterId) {
        query += `&chapterId=${chapterId}`;
      }
    }
    return api.get<Comment[]>(`/comments${query}`);
  },
  
  async addComment(commentData: { storyId: string, chapterId?: string | null, text: string, parentId?: string | null }): Promise<Comment> {
    return api.post<Comment>('/comments', commentData);
  },
  
  async toggleCommentLike(commentId: string): Promise<Comment> {
    return api.put<Comment>(`/comments/${commentId}/like`, {});
  },
  
  async togglePinComment(commentId: string): Promise<Comment> {
      return api.put<Comment>(`/comments/${commentId}/pin`, {});
  },
  
  async deleteComment(commentId: string): Promise<void> {
    await api.delete<void>(`/comments/${commentId}`);
  },

  // === Site Settings ===
  async getSiteSettings(): Promise<SiteSetting[]> {
    return api.get<SiteSetting[]>('/settings');
  },

  async updateSiteSettings(settings: Omit<SiteSetting, 'id'>[]): Promise<SiteSetting[]> {
    return api.put<SiteSetting[]>('/settings', settings);
  }
};
