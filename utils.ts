import { SERVER_ORIGIN } from './constants';

// Simple ID generator for demo purposes
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

// Generates a random alphanumeric ID of a given length
export const generateShortId = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const toAbsoluteUrl = (pathOrUrl: string | undefined | null): string => {
    if (!pathOrUrl) return '';
    // Check for relative API paths that we host
    if (pathOrUrl.startsWith('/api/')) {
        return `${SERVER_ORIGIN}${pathOrUrl}`;
    }
    // Return as is if it's already a full URL (http, https, data:) or something else
    return pathOrUrl;
};


export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/') && !file.type.startsWith('audio/')) {
      return reject(new Error('File must be an image, video, or audio file.'));
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

// A simple hashing function to convert a string (ID) to a number.
// This is NOT for cryptographic purposes.
const simpleHash = (str: string): number => {
  if (!str) return 0;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

export const generateFakeStoryStats = (storyId: string) => {
    const hash = simpleHash(storyId);

    // Views: between 1,000 and 10,000
    const views = (hash % 9001) + 1000;

    // Default values as requested
    const likes = 50;
    const ratingCount = 20;
    const rating = 4.0;

    return { views, likes, rating, ratingCount };
}


import { ContentBlock } from './types'; 

export const countWordsInContentBlocks = (contentBlocks?: ContentBlock[]): number => {
  if (!contentBlocks || contentBlocks.length === 0) {
    return 0;
  }
  let totalWords = 0;
  contentBlocks.forEach(block => {
    if (block.type === 'text' && block.value) {
      // Strip HTML tags before counting words
      const plainText = block.value.replace(/<[^>]*>/g, '');
      const words = plainText.trim().split(/\s+/).filter(Boolean); // Split by whitespace and remove empty strings
      totalWords += words.length;
    }
  });
  return totalWords;
};

export const getTodayDateString = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const formatRelativeTime = (timestamp?: number): string => {
  if (timestamp === undefined || timestamp === null) return '';
  
  const now = new Date();
  const seconds = Math.floor((now.getTime() - timestamp) / 1000);

  if (seconds < 60) return "";
  
  let interval = seconds / 31536000; // years
  if (interval >= 1) return Math.floor(interval) + " năm trước";
  
  interval = seconds / 2592000; // months
  if (interval >= 1) return Math.floor(interval) + " tháng trước";
  
  interval = seconds / 86400; // days
  if (interval >= 1) return Math.floor(interval) + " ngày trước";
  
  interval = seconds / 3600; // hours
  if (interval >= 1) return Math.floor(interval) + " giờ trước";
  
  interval = seconds / 60; // minutes
  if (interval >= 1) return Math.floor(interval) + " phút trước";
  
  return "";
};