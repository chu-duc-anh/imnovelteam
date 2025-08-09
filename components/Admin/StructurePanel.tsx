
import React, { useState } from 'react';
import { Volume, StoryChapter } from '../../types';
import { SelectedItem } from './StoryEditView';
import { createChapter, createVolume } from '../../constants';

interface StructurePanelProps {
    volumes: Volume[];
    selectedItem: SelectedItem;
    onSelectItem: (item: SelectedItem) => void;
    onStructureChange: (volumes: Volume[]) => void;
}

const isNew = (timestamp?: number) => {
    if (!timestamp) return false;
    const THREE_DAYS_IN_MS = 3 * 24 * 60 * 60 * 1000;
    return Date.now() - timestamp < THREE_DAYS_IN_MS;
};

const StructurePanel: React.FC<StructurePanelProps> = ({ volumes, selectedItem, onSelectItem, onStructureChange }) => {
    const [expandedVolumes, setExpandedVolumes] = useState<Set<string>>(new Set(volumes.map(v => v.id)));
    
    const toggleVolume = (volumeId: string) => {
        setExpandedVolumes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(volumeId)) {
                newSet.delete(volumeId);
            } else {
                newSet.add(volumeId);
            }
            return newSet;
        });
    };
    
    const handleAddVolume = () => {
        const newVolume = createVolume(`Tập ${volumes.length + 1}`);
        onStructureChange([...volumes, newVolume]);
    };

    const handleAddChapter = (volumeId: string) => {
        const newVolumes = volumes.map(vol => {
            if (vol.id === volumeId) {
                const newChapter = createChapter(`Chương ${vol.chapters.length + 1}`);
                return { ...vol, chapters: [...vol.chapters, newChapter] };
            }
            return vol;
        });
        onStructureChange(newVolumes);
    };

    const handleDelete = (type: 'volume' | 'chapter', volumeId: string, chapterId?: string) => {
        if (type === 'volume') {
            onStructureChange(volumes.filter(v => v.id !== volumeId));
            if (selectedItem.type !== 'story' && selectedItem.id === volumeId) {
                onSelectItem({ type: 'story' });
            }
        } else if (type === 'chapter' && chapterId) {
            const newVolumes = volumes.map(vol => {
                if (vol.id === volumeId) {
                    return { ...vol, chapters: vol.chapters.filter(c => c.id !== chapterId) };
                }
                return vol;
            });
            onStructureChange(newVolumes);
            if (selectedItem.type === 'chapter' && selectedItem.id === chapterId) {
                onSelectItem({ type: 'volume', id: volumeId });
            }
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-primary-200 dark:border-primary-800 flex-shrink-0">
                <h2 className="text-lg font-semibold font-serif text-primary-800 dark:text-primary-200">Cấu trúc truyện</h2>
            </div>
            <div className="flex-grow p-3 overflow-y-auto">
                <button
                    onClick={() => onSelectItem({ type: 'story' })}
                    className={`w-full text-left font-semibold p-2.5 rounded-md text-sm mb-3 transition-colors flex items-center gap-2 ${selectedItem.type === 'story' ? 'bg-secondary-100 dark:bg-secondary-500/30 text-secondary-700 dark:text-secondary-200' : 'hover:bg-primary-100 dark:hover:bg-primary-800/60'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    Cài đặt truyện
                </button>
                
                <ul className="space-y-1">
                    {volumes.map(volume => (
                        <li key={volume.id}>
                            <div className={`group flex items-center justify-between p-2 rounded-md transition-colors text-sm font-medium cursor-pointer ${selectedItem.type === 'volume' && selectedItem.id === volume.id ? 'bg-secondary-100 dark:bg-secondary-500/20 text-secondary-700 dark:text-secondary-300' : 'hover:bg-primary-100 dark:hover:bg-primary-800/60'}`}>
                                <div onClick={() => onSelectItem({ type: 'volume', id: volume.id })} className="flex items-center gap-2 flex-grow truncate">
                                    <button onClick={(e) => { e.stopPropagation(); toggleVolume(volume.id); }} className="p-1 rounded hover:bg-primary-200 dark:hover:bg-primary-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${expandedVolumes.has(volume.id) ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                                    </button>
                                    <span className="truncate">{volume.title}</span>
                                    {isNew(volume.timestamp) && (
                                        <span className="ml-2 text-[10px] font-bold text-red-500">NEW</span>
                                    )}
                                </div>
                                <div className="flex-shrink-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleDelete('volume', volume.id)} className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg></button>
                                </div>
                            </div>
                            {expandedVolumes.has(volume.id) && (
                                <ul className="pl-6 pt-1 space-y-1">
                                    {volume.chapters.map(chapter => (
                                        <li key={chapter.id}>
                                            <div className={`group flex items-center justify-between py-1.5 px-2 rounded-md text-xs cursor-pointer transition-colors ${selectedItem.type === 'chapter' && selectedItem.id === chapter.id ? 'bg-secondary-100 dark:bg-secondary-500/20 text-secondary-700 dark:text-secondary-300' : 'hover:bg-primary-100 dark:hover:bg-primary-800/60'}`}>
                                                <div onClick={() => onSelectItem({ type: 'chapter', volumeId: volume.id, id: chapter.id })} className="flex-grow truncate flex items-center gap-1.5">
                                                    <span>{chapter.title}</span>
                                                     {isNew(chapter.timestamp) && (
                                                        <span className="text-[9px] font-bold text-red-500">NEW</span>
                                                    )}
                                                </div>
                                                <button onClick={() => handleDelete('chapter', volume.id, chapter.id)} className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>
                                            </div>
                                        </li>
                                    ))}
                                    <li><button onClick={() => handleAddChapter(volume.id)} className="w-full text-left py-1.5 px-2 rounded-md text-xs text-primary-500 hover:bg-green-100 dark:hover:bg-green-500/20 hover:text-green-700 dark:hover:text-green-300 transition-colors">+ Thêm chương</button></li>
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="p-3 border-t border-primary-200 dark:border-primary-800 flex-shrink-0">
                <button onClick={handleAddVolume} className="w-full text-center p-2 rounded-md text-sm font-semibold text-secondary-600 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-500/20 transition-colors">+ Thêm tập mới</button>
            </div>
        </div>
    );
};

export default StructurePanel;
