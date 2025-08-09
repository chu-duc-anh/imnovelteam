
import React, { useState, useEffect, useRef } from 'react';
import { Story, Volume, StoryChapter, User, ContentBlock, ContentBlockText, ContentBlockImage, Comment } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { generateId, fileToDataUrl, countWordsInContentBlocks } from '../utils'; 
import ContentEditableDiv from './ContentEditableDiv'; 
import CommentSection from './CommentSection';

interface ChapterViewProps {
  story: Story;
  volumeId: string;
  chapterId: string;
  comments: Comment[];
  onNavigateChapter: (direction: 'prev' | 'next') => void;
  onGoToStoryDetail: (storyId: string, volumeId: string | null) => void;
  currentUser: User | null;
  onAddComment: (storyId: string, text: string, parentId: string | null, chapterId: string | null) => Promise<void>;
  onDeleteComment: (commentId: string, storyId: string) => void;
  onToggleCommentLike: (commentId: string) => void;
  onTogglePinComment: (commentId: string) => void;
  onLoginClick: () => void;
  proseSizeClass: string;
  onProseSizeChange: (direction: 'increase' | 'decrease') => void;
  onSelectChapter: (chapterId: string) => void;
}

const PROSE_CLASSES = ['prose-sm', 'prose-base', 'prose-lg', 'prose-xl', 'prose-2xl', 'prose-3xl', 'prose-4xl'];

const ChapterView: React.FC<ChapterViewProps> = ({
  story,
  volumeId,
  chapterId,
  comments,
  onNavigateChapter,
  onGoToStoryDetail,
  currentUser,
  onAddComment,
  onDeleteComment,
  onToggleCommentLike,
  onTogglePinComment,
  onLoginClick,
  proseSizeClass,
  onProseSizeChange,
  onSelectChapter,
}) => {
  const [isChapterListOpen, setIsChapterListOpen] = useState(false);
  const [isScrollButtonVisible, setIsScrollButtonVisible] = useState(false);
  const currentVolume = story.volumes.find(v => v.id === volumeId);
  const currentChapterIndex = currentVolume ? currentVolume.chapters.findIndex(ch => ch.id === chapterId) : -1;
  const chapter = currentVolume && currentChapterIndex !== -1 ? currentVolume.chapters[currentChapterIndex] : null;

  const isValidHttpUrl = (urlString: string): boolean => {
    try { 
      const url = new URL(urlString);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (e) { return false; }
  };
  
  const isDataUrl = (urlString: string): boolean => {
    return typeof urlString === 'string' && urlString.startsWith('data:image');
  }

  const initializeBlocks = (blocksToInit: ContentBlock[] | undefined): ContentBlock[] => {
    return (blocksToInit && blocksToInit.length > 0 ? blocksToInit : [{type: 'text', id: generateId(), value: '<p><br></p>'}])
    .map(b => {
        let currentBlock = {...b, id: b.id || generateId()};
        if (currentBlock.type === 'text' && (!currentBlock.value || currentBlock.value.trim() === '' || currentBlock.value.trim() === '<p></p>')) {
          currentBlock.value = '<p><br></p>';
        }
        return currentBlock;
    });
  }

  const hasPrevChapter = currentVolume ? currentChapterIndex > 0 : false;
  const hasNextChapter = currentVolume ? currentChapterIndex < currentVolume.chapters.length - 1 : false;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
            return;
        }

        if (event.key === 'ArrowLeft' && hasPrevChapter) onNavigateChapter('prev');
        else if (event.key === 'ArrowRight' && hasNextChapter) onNavigateChapter('next');
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
}, [onNavigateChapter, hasPrevChapter, hasNextChapter]);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsScrollButtonVisible(true);
      } else {
        setIsScrollButtonVisible(false);
      }
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };


  if (!currentVolume || !chapter) {
    return (
      <div className="text-center py-10 bg-primary-100/95 dark:bg-primary-950/90 p-6 rounded-2xl shadow-xl backdrop-blur-lg">
        <p className="text-red-500 text-lg">Chapter or Volume not found.</p>
        <button
          onClick={() => onGoToStoryDetail(story.id, volumeId)}
          className="mt-4 px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700"
        >
          Back to Story Details
        </button>
      </div>
    );
  }
  
  const currentBlocksToRender = initializeBlocks(chapter.contentBlocks);
  const wordCount = countWordsInContentBlocks(currentBlocksToRender);
  
  const baseFontButtonClass = "w-12 h-10 flex items-center justify-center text-lg font-bold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 dark:focus:ring-offset-primary-900 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-px";

  const decreaseButtonClass = `${baseFontButtonClass} border-2 border-primary-600 dark:border-primary-400 text-primary-700 dark:text-primary-300 bg-transparent hover:bg-primary-600/10 dark:hover:bg-primary-400/10`;
  
  const increaseButtonClass = `${baseFontButtonClass} border-2 border-primary-200 dark:border-primary-800 bg-primary-200 dark:bg-primary-800 text-primary-700 dark:text-primary-200 hover:bg-primary-300 dark:hover:bg-primary-700`;

  return (
    <>
      <div className="max-w-6xl mx-auto my-8 p-4 sm:p-6 lg:p-8 bg-primary-100/95 dark:bg-primary-950/90 rounded-2xl shadow-2xl border border-primary-200/50 dark:border-primary-800/50">
        <div className="mb-8">
          <button 
            onClick={() => onGoToStoryDetail(story.id, volumeId)} 
            className="mb-6 text-sm text-secondary-600 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300 flex items-center group focus:outline-none focus:ring-2 focus:ring-secondary-500 rounded-md p-1"
            aria-label={`Back to volume ${currentVolume.title} for ${story.title}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to: {currentVolume.title} ({story.title})
          </button>
          <div className="flex justify-between items-start mb-2">
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary-900 dark:text-primary-100">{chapter.title}</h1>
          </div>
          <div className="flex justify-between items-center border-b border-primary-200 dark:border-primary-800 pb-4">
              <p className="text-sm text-primary-500 dark:text-primary-400">
                Chapter {currentChapterIndex + 1} of {currentVolume.chapters.length} &bull; {wordCount} words
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onProseSizeChange('decrease')}
                  disabled={proseSizeClass === PROSE_CLASSES[0]}
                  className={decreaseButtonClass}
                  aria-label="Decrease font size"
                >
                  A-
                </button>
                <button
                  onClick={() => onProseSizeChange('increase')}
                  disabled={proseSizeClass === PROSE_CLASSES[PROSE_CLASSES.length - 1]}
                  className={increaseButtonClass}
                  aria-label="Increase font size"
                >
                  A+
                </button>
              </div>
          </div>
        </div>

        <article>
          <div className={`prose dark:prose-invert max-w-none prose-headings:font-serif prose-img:rounded-xl prose-img:shadow-xl prose-img:border prose-img:border-primary-200 dark:prose-img:border-primary-700 prose-img:max-h-[75vh] ${proseSizeClass}`}>
            {currentBlocksToRender.length > 0 ? currentBlocksToRender.map((block) => (
              <div key={block.id} className={`my-2`}>
                {block.type === 'text' ? (
                    <div dangerouslySetInnerHTML={{ __html: block.value || '<p><br></p>' }} />
                ) : block.type === 'image' && block.value && (isValidHttpUrl(block.value) || isDataUrl(block.value)) ? ( 
                    <figure className="my-6 text-center">
                      <img src={block.value} alt={block.alt || chapter.title} className="mx-auto" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      {block.alt && <figcaption className="text-sm text-primary-600 dark:text-primary-400 mt-2 italic">{block.alt}</figcaption>}
                    </figure>
                ) : null}
              </div>
            )) : (
               <p className="text-lg text-primary-500 my-10 text-center">This chapter has no content yet.</p>
            )}
          </div>
        </article>

        <div className="mt-12 pt-6 border-t border-primary-200 dark:border-primary-800 flex justify-between items-center">
          <button onClick={() => onNavigateChapter('prev')} disabled={!hasPrevChapter} className="px-4 py-2 sm:px-5 sm:py-2.5 bg-primary-200 dark:bg-primary-800 text-primary-800 dark:text-primary-200 text-sm sm:text-base font-semibold rounded-lg hover:bg-primary-300 dark:hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
            TRƯỚC
          </button>
          <button onClick={() => onNavigateChapter('next')} disabled={!hasNextChapter} className="px-4 py-2 sm:px-5 sm:py-2.5 bg-secondary-500 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-secondary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            SAU
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
          </button>
        </div>

         <div>
            <CommentSection
              sectionTitle="Chapter Comments"
              storyCreatorId={story.creatorId?.id}
              comments={comments}
              currentUser={currentUser}
              onAddComment={(text, parentId) => onAddComment(story.id, text, parentId, chapter.id)}
              onDeleteComment={(commentId) => onDeleteComment(commentId, story.id)}
              onToggleCommentLike={onToggleCommentLike}
              onTogglePinComment={onTogglePinComment}
              onLoginClick={onLoginClick}
            />
         </div>
      </div>

      {/* Floating Action Buttons Container */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center space-y-3">
        {/* Scroll to Top Button */}
        <button
          onClick={scrollToTop}
          className={`bg-red-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-500/50 transform transition-all duration-300 ease-in-out ${
            isScrollButtonVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}
          aria-label="Scroll to top"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75" />
          </svg>
        </button>
        {/* Chapter List Button */}
        <button
          onClick={() => setIsChapterListOpen(true)}
          className="bg-red-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-500/50 transform transition-transform hover:scale-110"
          aria-label="Open chapter list"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>


      {/* Chapter List Modal */}
      {isChapterListOpen && (
          <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center transition-opacity duration-300 ease-in-out animate-fade-in"
              onClick={() => setIsChapterListOpen(false)}
          >
              <div 
                  className="bg-white dark:bg-primary-900 rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col m-4 transform transition-all duration-300 ease-out animate-scale-up"
                  onClick={e => e.stopPropagation()}
              >
                  {/* Header */}
                  <div className="flex justify-between items-center p-4 border-b border-primary-200 dark:border-primary-800 flex-shrink-0">
                      <h3 className="font-serif text-xl font-bold text-primary-800 dark:text-primary-100">Danh sách chương</h3>
                      <button 
                          onClick={() => setIsChapterListOpen(false)}
                          className="p-2 rounded-full text-primary-500 hover:bg-primary-100 dark:hover:bg-primary-800"
                          aria-label="Close chapter list"
                      >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                      </button>
                  </div>
                  {/* List */}
                  <ul className="overflow-y-auto p-2 flex-grow">
                      {currentVolume.chapters.map((ch, index) => (
                          <li key={ch.id}>
                              <button 
                                  onClick={() => {
                                      onSelectChapter(ch.id);
                                      setIsChapterListOpen(false);
                                  }}
                                  className={`w-full text-left p-3 my-1 rounded-lg transition-colors text-sm ${ch.id === chapterId ? 'bg-secondary-100 dark:bg-secondary-500/20 text-secondary-700 dark:text-secondary-300 font-semibold' : 'hover:bg-primary-100 dark:hover:bg-primary-800 text-primary-800 dark:text-primary-200'}`}
                              >
                                  <span className={`mr-2 font-mono ${ch.id === chapterId ? 'text-secondary-500' : 'text-primary-500 dark:text-primary-400'}`}>{index + 1}.</span>
                                  {ch.title}
                              </button>
                          </li>
                      ))}
                  </ul>
              </div>
              <style>{`
                  @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                  @keyframes scale-up { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                  .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
                  .animate-scale-up { animation: scale-up 0.2s ease-out forwards; }
              `}</style>
          </div>
      )}
    </>
  );
};

export default ChapterView;
