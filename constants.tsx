import { Story, ContentBlock, ContentBlockText, ContentBlockImage, Volume, StoryChapter } from './types';
import { generateId } from './utils'; // For generating IDs

export const SERVER_ORIGIN = 'https://imnovelteambackend-1.onrender.com';
export const GEMINI_TEXT_MODEL = 'gemini-2.5-flash';

// Default SVG avatar placeholder - Using the one from previous interactions
export const DEFAULT_AVATAR_URL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a0aec0'%3E%3Cpath fill-rule='evenodd' d='M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15c1.447 0 2.796.414 3.91 1.153A7.47 7.47 0 0 1 18 12c0-4.135-3.365-7.5-7.5-7.5S3 7.865 3 12a7.47 7.47 0 0 1 2.088 5.002Z' clip-rule='evenodd' /%3E%3Cpath d='M12 9a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5ZM12 15a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5Z' /%3E%3C/svg%3E";

// New professional avatar for the Admin in chat
export const ADMIN_AVATAR_URL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' rx='12' fill='%237c3aed'/%3E%3Cpath d='M12 2.25c.48 0 .93.1 1.36.29l6.52 2.81c.47.2.77.68.77 1.2v5.1c0 4.61-3.52 8.86-8.23 9.94a.97.97 0 01-.94 0C6.77 21.59 3.25 17.34 3.25 12.75v-5.1c0-.52.3-1 .77-1.2l6.52-2.81c.43-.19.88-.29 1.36-.29z' fill='white' fill-opacity='0.4' /%3E%3Cpath d='M10.5 14.25L7.75 11.5l-1.5 1.5L10.5 17.25l6.5-6.5-1.5-1.5L10.5 14.25z' fill='white' /%3E%3C/svg%3E";

// Helper to create a text content block
export const createText = (paragraphValue: string): ContentBlockText => {
  const id = generateId();
  const trimmedValue = paragraphValue.trim();
  let htmlValue = trimmedValue;

  if (!trimmedValue || trimmedValue === '<p></p>') {
    htmlValue = '<p><br></p>'; 
  } else {
    // If it's not already wrapped in <p> (e.g. old plain text), wrap it and convert newlines
    // This logic is important for contentEditable compatibility and ensuring distinct paragraphs.
    if (!trimmedValue.startsWith('<p') || !trimmedValue.endsWith('</p>')) {
        htmlValue = `<p>${trimmedValue.replace(/\n/g, '<br />')}</p>`;
    } else {
        // It's already HTML, assume it's well-formed enough for contentEditable
        htmlValue = trimmedValue;
    }
  }
  return { type: 'text', id, value: htmlValue };
};

// Helper to create an image content block
export const createImage = (url: string, alt: string = ''): ContentBlockImage => {
  return { type: 'image', id: generateId(), value: url.trim(), alt: alt.trim() };
};

// Helper to create an array of text blocks from a multi-paragraph string
export const createInitialTextBlocks = (multiParagraphString: string): ContentBlockText[] => {
  const trimmedInput = multiParagraphString.trim();
  if (!trimmedInput) {
    return [createText('')]; // Return a single empty block with <p><br></p>
  }
  // Split by one or more newlines sequences, potentially surrounded by whitespace, to denote paragraphs
  const paragraphs = trimmedInput.split(/\n\s*\n/);
  return paragraphs.map(p => createText(p.trim())); // Trim each paragraph before creating text block
};

// Helper to create a chapter
export const createChapter = (title: string, contentBlocksInput?: ContentBlock[]): StoryChapter => {
  const id = generateId();
  let finalContentBlocks: ContentBlock[];

  if (contentBlocksInput && contentBlocksInput.length > 0) {
    finalContentBlocks = contentBlocksInput.map(bInput => {
        // Ensure block has an ID and correct structure based on type
        const blockId = bInput?.id || generateId();
        if (bInput?.type === 'text') {
            // Use createText to ensure consistent formatting, especially for empty states
            return { ...createText((bInput as ContentBlockText)?.value || ''), id: blockId };
        } else if (bInput?.type === 'image') {
            return { ...createImage((bInput as ContentBlockImage)?.value || '', (bInput as ContentBlockImage)?.alt), id: blockId };
        }
        // Fallback for malformed or untyped blocks, ensuring it's a valid ContentBlock
        return { ...createText(''), id: blockId }; 
    });
  } else {
    finalContentBlocks = [createText('')]; // Default with one empty text block
  }

  return {
    id,
    title: title.trim() || "Untitled Chapter",
    contentBlocks: finalContentBlocks,
    timestamp: Date.now(),
  };
};

// Helper to create a volume
export const createVolume = (title: string, coverImageUrl?: string, chaptersInput?: StoryChapter[]): Volume => {
  const id = generateId();
  let finalChapters: StoryChapter[];

  if (chaptersInput && chaptersInput.length > 0) {
    finalChapters = chaptersInput.map(chInput => {
        const chapterTitle = chInput?.title || "Untitled Chapter";
        // Ensure chapters are also robustly created with default content if necessary
        return createChapter(chapterTitle, chInput?.contentBlocks);
      });
  } else {
    // Default with one chapter (which will get its own default content block via createChapter)
    finalChapters = [createChapter("Chapter 1 (Default)")]; 
  }

  return {
    id,
    title: title.trim() || "Untitled Volume",
    coverImageUrl: coverImageUrl ? coverImageUrl.trim() : undefined,
    chapters: finalChapters,
    timestamp: Date.now(),
  };
};
