import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Story, Volume, StoryChapter, ContentBlock, User } from '../../types';
import LoadingSpinner from '../LoadingSpinner';
import StructurePanel from './StructurePanel';
import ContentEditorPanel from './ContentEditorPanel';
import MetadataPanel from './MetadataPanel';
import { createText } from '../../constants';

export type SelectedItem = 
  | { type: 'story' }
  | { type: 'volume'; id: string }
  | { type: 'chapter'; volumeId: string; id: string };

interface StoryEditViewProps {
  story: Story;
  onSave: (story: Story) => Promise<void>;
  onCancel: () => void;
}

const StoryEditView: React.FC<StoryEditViewProps> = ({ story: initialStory, onSave, onCancel }) => {
  const normalizedInitialStory = useMemo(() => {
    const volumes = (initialStory.volumes || []).map(volume => ({
      ...volume,
      chapters: (volume.chapters || []).map(chapter => {
        const hasValidBlocks = Array.isArray(chapter.contentBlocks) && chapter.contentBlocks.length > 0;
        return {
          ...chapter,
          contentBlocks: hasValidBlocks ? chapter.contentBlocks : [createText('')],
        };
      }),
    }));

    return {
      ...initialStory,
      volumes,
    };
  }, [initialStory]);
  
  const [editedStory, setEditedStory] = useState<Story>(normalizedInitialStory);
  const [selectedItem, setSelectedItem] = useState<SelectedItem>({ type: 'story' });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEditedStory(normalizedInitialStory);
    setSelectedItem({ type: 'story' });
  }, [normalizedInitialStory]);
  
  const handleSelectItem = (item: SelectedItem) => {
    setSelectedItem(item);
  };
  
  const getSelectedEntity = () => {
    if (selectedItem.type === 'story') {
        return { entity: editedStory, entityType: 'story' };
    }
    if (selectedItem.type === 'volume') {
        const vol = editedStory.volumes.find(v => v.id === selectedItem.id);
        return { entity: vol, entityType: 'volume' };
    }
    if (selectedItem.type === 'chapter') {
        const vol = editedStory.volumes.find(v => v.id === selectedItem.volumeId);
        const chap = vol?.chapters.find(c => c.id === selectedItem.id);
        return { entity: chap, entityType: 'chapter' };
    }
    return { entity: null, entityType: null };
  };

  const { entity: selectedEntity, entityType } = getSelectedEntity();
  
  const handleContentBlocksUpdate = (newBlocks: ContentBlock[]) => {
      if (selectedItem.type !== 'chapter') return;

      setEditedStory(currentStory => {
          const newVolumes = currentStory.volumes.map(vol => {
              if (vol.id === selectedItem.volumeId) {
                  const newChapters = vol.chapters.map(chap => {
                      if (chap.id === selectedItem.id) {
                          return { ...chap, contentBlocks: newBlocks };
                      }
                      return chap;
                  });
                  return { ...vol, chapters: newChapters };
              }
              return vol;
          });
          return { ...currentStory, volumes: newVolumes, lastUpdated: Date.now() };
      });
  };

  const handleMetadataUpdate = (updates: Partial<Story | Volume | StoryChapter>) => {
    setEditedStory(currentStory => {
        let newStory = { ...currentStory };
        if (selectedItem.type === 'story') {
            newStory = { ...newStory, ...updates };
        } else if (selectedItem.type === 'volume') {
            newStory.volumes = newStory.volumes.map(v => v.id === selectedItem.id ? { ...v, ...updates } : v);
        } else if (selectedItem.type === 'chapter') {
            newStory.volumes = newStory.volumes.map(v => {
                if (v.id === selectedItem.volumeId) {
                    v.chapters = v.chapters.map(c => {
                        if (c.id === selectedItem.id) {
                            return { ...c, ...updates } as StoryChapter;
                        }
                        return c;
                    });
                }
                return v;
            });
        }
        return { ...newStory, lastUpdated: Date.now() };
    });
  };
  
  const handleStructureChange = (newVolumes: Volume[]) => {
      setEditedStory(prev => ({ ...prev, volumes: newVolumes, lastUpdated: Date.now() }));
  }

  const handleSaveClick = async () => {
    setError(null);
    setIsSaving(true);
    try {
        // Basic validation
        if (!editedStory.title.trim()) throw new Error("Story title cannot be empty.");
        if (!editedStory.author.trim()) throw new Error("Story author cannot be empty.");
        if (editedStory.genres.length === 0) throw new Error("At least one genre is required.");
        if (!editedStory.description.trim()) throw new Error("Story description cannot be empty.");

        await onSave(editedStory);
    } catch(err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred during save.");
        setIsSaving(false);
    }
  };
  
  const selectedChapterForPanel = selectedItem.type === 'chapter' 
    ? editedStory.volumes.find(v => v.id === selectedItem.volumeId)?.chapters.find(c => c.id === selectedItem.id) || null 
    : null;

  return (
    <div className="fixed inset-0 bg-primary-100 dark:bg-primary-950 flex flex-col z-[100]">
      <header className="flex-shrink-0 bg-white dark:bg-primary-900 border-b border-primary-200 dark:border-primary-800 p-3 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-md">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-grow min-w-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-secondary-500 flex-shrink-0">
               <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold font-serif text-primary-800 dark:text-primary-100 truncate">
                  Đang chỉnh sửa: {editedStory.title || 'Truyện mới'}
              </h1>
              <p className="text-xs text-primary-500">Cập nhật lần cuối: {new Date(editedStory.lastUpdated || Date.now()).toLocaleString()}</p>
            </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary-200 dark:bg-primary-700 hover:bg-primary-300 dark:hover:bg-primary-600 text-primary-800 dark:text-primary-100 transition-colors">
            Hủy
          </button>
          <button onClick={handleSaveClick} disabled={isSaving} className="px-5 py-2 text-sm font-semibold rounded-lg bg-secondary-500 hover:bg-secondary-600 text-white transition-colors shadow-md disabled:opacity-50 disabled:cursor-wait flex items-center gap-2">
            {isSaving ? <LoadingSpinner size="sm"/> : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7.5 2.75a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5z" />
                  <path fillRule="evenodd" d="M4.5 3.5a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM8.25 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 018.25 2zM12 3.5a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5zm-3.75-.75a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM12.75 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75zM15 3.5a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5zM11.25 2a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM6 5.25a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75zM6.75 6a.75.75 0 000 1.5h.01a.75.75 0 000-1.5H6.75zM6 8.25a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75zm.75.75a.75.75 0 000 1.5h.01a.75.75 0 000-1.5H6.75zM6 11.25a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75zm.75.75a.75.75 0 000 1.5h.01a.75.75 0 000-1.5H6.75zM6 14.25a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5H6.75a.75.75 0 01-.75-.75zm.75.75a.75.75 0 000 1.5h.01a.75.75 0 000-1.5H6.75zM8.25 5a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5h-7.5zM8.25 8a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5h-7.5zm0 3a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5h-7.5zm0 3a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5h-7.5z" clipRule="evenodd" />
                </svg>
            )}
            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </header>
      
      {error && (
        <div className="p-3 bg-red-500 text-white text-sm text-center sticky top-[65px] z-20 shadow-lg">
          <strong>Lỗi:</strong> {error}
        </div>
      )}

      <main className="flex-grow grid grid-cols-1 md:grid-cols-12 gap-0 h-full overflow-hidden">
        {/* Left Panel: Structure */}
        <div className="col-span-12 md:col-span-3 lg:col-span-3 xl:col-span-2 bg-primary-50 dark:bg-primary-900 border-r border-primary-200 dark:border-primary-800 overflow-y-auto flex flex-col">
            <StructurePanel 
                volumes={editedStory.volumes} 
                selectedItem={selectedItem}
                onSelectItem={handleSelectItem}
                onStructureChange={handleStructureChange}
            />
        </div>

        {/* Center Panel: Content Editor */}
        <div className="col-span-12 md:col-span-5 lg:col-span-6 xl:col-span-7 overflow-y-auto bg-primary-100 dark:bg-primary-950">
            <ContentEditorPanel
                key={selectedChapterForPanel?.id || 'no-chapter-selected'}
                chapter={selectedChapterForPanel}
                onUpdateBlocks={handleContentBlocksUpdate}
            />
        </div>
        
        {/* Right Panel: Metadata */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3 xl:col-span-3 bg-white dark:bg-primary-900 border-l border-primary-200 dark:border-primary-800 overflow-y-auto">
             <MetadataPanel
                story={editedStory}
                selectedItem={selectedItem}
                onUpdateMetadata={handleMetadataUpdate}
                initialStoryId={initialStory.id}
             />
        </div>
      </main>
    </div>
  );
};

export default StoryEditView;
