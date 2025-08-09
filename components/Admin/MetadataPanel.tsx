

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Story, Volume, StoryChapter } from '../../types';
import { SelectedItem } from './StoryEditView';
import { fileToDataUrl } from '../../utils';
import { dataService } from '../../services/dataService';
import LoadingSpinner from '../LoadingSpinner';

interface MetadataPanelProps {
    story: Story;
    selectedItem: SelectedItem;
    onUpdateMetadata: (updates: Partial<Story | Volume | StoryChapter>) => void;
    allStories: Story[];
    initialStoryId: string;
}

const MetadataPanel: React.FC<MetadataPanelProps> = ({ story, selectedItem, onUpdateMetadata, allStories, initialStoryId }) => {
    const [titleStatus, setTitleStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
    const [titleMessage, setTitleMessage] = useState<string | null>(null);
    const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const getEntity = useCallback(() => {
        switch (selectedItem.type) {
            case 'story': return story;
            case 'volume': return story.volumes.find(v => v.id === selectedItem.id);
            case 'chapter': return story.volumes.find(v => v.id === selectedItem.volumeId)?.chapters.find(c => c.id === selectedItem.id);
            default: return null;
        }
    }, [story, selectedItem]);

    const entity = getEntity();

    useEffect(() => {
        setTitleStatus('idle');
        setTitleMessage(null);
    }, [entity]);

    const checkTitleAvailability = async (currentTitle: string) => {
        const trimmedTitle = currentTitle.trim();
        if (!trimmedTitle || selectedItem.type !== 'story') {
            setTitleStatus('idle');
            setTitleMessage(null);
            return;
        }
        setTitleStatus('checking');
        setTitleMessage(null);

        try {
            const isAvailable = await dataService.checkStoryTitleAvailability(trimmedTitle, initialStoryId || undefined);

            if (isAvailable) {
                setTitleStatus('available');
                setTitleMessage("Tiêu đề khả dụng");
            } else {
                setTitleStatus('unavailable');
                setTitleMessage("Tiêu đề đã tồn tại");
            }
        } catch (error) {
            setTitleStatus('unavailable');
            setTitleMessage("Không thể kiểm tra tiêu đề.");
            console.error("Error checking title availability:", error);
        }
    };

    const handleTitleChange = (newTitle: string) => {
        onUpdateMetadata({ title: newTitle });
        if (selectedItem.type === 'story') {
            if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
            debounceTimeout.current = setTimeout(() => {
                checkTitleAvailability(newTitle);
            }, 500);
        }
    };

    const handleFieldChange = (field: string, value: any) => {
        onUpdateMetadata({ [field]: value });
    };

    const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const dataUrl = await fileToDataUrl(e.target.files[0]);
            onUpdateMetadata({ coverImageUrl: dataUrl });
        }
    };
    
    const inputClasses = "w-full text-sm p-2.5 rounded-lg bg-primary-100 dark:bg-primary-800 border border-primary-200 dark:border-primary-700 focus:ring-secondary-500 focus:border-secondary-500";
    const labelClasses = "block text-xs font-semibold text-primary-500 dark:text-primary-400 mb-1.5";

    const renderStoryFields = () => (
        <>
            <h3 className="text-lg font-bold font-serif">Siêu dữ liệu truyện</h3>
            <div className="mt-4 space-y-4">
                <div>
                    <label htmlFor="meta-title" className={labelClasses}>Tiêu đề</label>
                    <input id="meta-title" type="text" value={story.title} onChange={e => handleTitleChange(e.target.value)} className={inputClasses}/>
                    {titleStatus !== 'idle' && (
                         <p className={`text-xs mt-1 flex items-center ${
                            titleStatus === 'available' ? 'text-green-500' : 
                            titleStatus === 'unavailable' ? 'text-red-500' : 
                            'text-primary-500'}`
                        }>
                            {titleStatus === 'checking' && <LoadingSpinner size="sm" className="!py-0 w-4 h-4 mr-2"/>}
                            {titleMessage}
                        </p>
                    )}
                </div>
                <div><label htmlFor="meta-author" className={labelClasses}>Tác giả</label><input id="meta-author" type="text" value={story.author} onChange={e => handleFieldChange('author', e.target.value)} className={inputClasses}/></div>
                <div><label htmlFor="meta-translator" className={labelClasses}>Tên nhà dịch (Team dịch)</label><input id="meta-translator" type="text" value={story.translator || ''} onChange={e => handleFieldChange('translator', e.target.value)} className={inputClasses}/></div>
                
                <div>
                    <label className={labelClasses}>Tên khác</label>
                    <div className="space-y-2 p-2 bg-primary-50 dark:bg-primary-800/50 rounded-lg border border-primary-200 dark:border-primary-700/50">
                        {(story.alternativeTitles || []).map((title, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => {
                                        const newAltTitles = [...(story.alternativeTitles || [])];
                                        newAltTitles[index] = e.target.value;
                                        handleFieldChange('alternativeTitles', newAltTitles);
                                    }}
                                    onBlur={() => {
                                        // On blur, filter out any empty titles to keep the list clean
                                        handleFieldChange('alternativeTitles', (story.alternativeTitles || []).filter(t => t.trim() !== ''));
                                    }}
                                    className={`${inputClasses} flex-grow`}
                                    placeholder={`Tên khác #${index + 1}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newAltTitles = (story.alternativeTitles || []).filter((_, i) => i !== index);
                                        handleFieldChange('alternativeTitles', newAltTitles);
                                    }}
                                    className="p-2.5 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/60 transition-colors flex-shrink-0"
                                    aria-label={`Remove alternative title ${index + 1}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                         { (story.alternativeTitles || []).length === 0 && (
                            <p className="px-2 py-4 text-center text-xs text-primary-500 dark:text-primary-400">Chưa có tên khác nào.</p>
                        )}
                        <button
                            type="button"
                            onClick={() => {
                                const newAltTitles = [...(story.alternativeTitles || []), ''];
                                handleFieldChange('alternativeTitles', newAltTitles);
                            }}
                            className="w-full mt-2 p-2 text-sm font-semibold rounded-lg bg-primary-200/50 dark:bg-primary-700/50 hover:bg-primary-200 dark:hover:bg-primary-700 text-primary-700 dark:text-primary-200 transition-colors flex items-center justify-center gap-2"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Thêm tên khác
                        </button>
                    </div>
                </div>
                
                <div>
                    <label className={labelClasses}>Thể loại</label>
                    <div className="space-y-2 p-2 bg-primary-50 dark:bg-primary-800/50 rounded-lg border border-primary-200 dark:border-primary-700/50">
                        {(story.genres || []).map((genre, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={genre}
                                    onChange={(e) => {
                                        const newGenres = [...(story.genres || [])];
                                        newGenres[index] = e.target.value;
                                        handleFieldChange('genres', newGenres);
                                    }}
                                    onBlur={() => {
                                        const finalGenres = (story.genres || [])
                                            .flatMap(g => g.split(',')) 
                                            .map(g => g.trim())        
                                            .filter(g => g !== '');     
                                        handleFieldChange('genres', [...new Set(finalGenres)]);
                                    }}
                                    className={`${inputClasses} flex-grow`}
                                    placeholder={`Thể loại #${index + 1}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newGenres = (story.genres || []).filter((_, i) => i !== index);
                                        handleFieldChange('genres', newGenres);
                                    }}
                                    className="p-2.5 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/60 transition-colors flex-shrink-0"
                                    aria-label={`Remove genre ${index + 1}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                        { (story.genres || []).length === 0 && (
                            <p className="px-2 py-4 text-center text-xs text-primary-500 dark:text-primary-400">Chưa có thể loại nào.</p>
                        )}
                        <button
                            type="button"
                            onClick={() => {
                                const newGenres = [...(story.genres || []), ''];
                                handleFieldChange('genres', newGenres);
                            }}
                            className="w-full mt-2 p-2 text-sm font-semibold rounded-lg bg-primary-200/50 dark:bg-primary-700/50 hover:bg-primary-200 dark:hover:bg-primary-700 text-primary-700 dark:text-primary-200 transition-colors flex items-center justify-center gap-2"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Thêm thể loại
                        </button>
                    </div>
                </div>

                <div><label htmlFor="meta-description" className={labelClasses}>Mô tả</label><textarea id="meta-description" value={story.description} onChange={e => handleFieldChange('description', e.target.value)} className={`${inputClasses} min-h-[100px]`} /></div>
                
                <div>
                    <label className={labelClasses}>Ảnh bìa</label>
                    {story.coverImageUrl && <img src={story.coverImageUrl} alt="cover" className="max-h-32 rounded-md my-2"/>}
                    <input type="text" placeholder="URL hình ảnh" value={story.coverImageUrl && !story.coverImageUrl.startsWith('data:') ? story.coverImageUrl : ''} onChange={e => handleFieldChange('coverImageUrl', e.target.value)} className={inputClasses}/>
                    <input type="file" accept="image/*" onChange={handleCoverImageUpload} className="w-full text-xs text-primary-600 dark:text-primary-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-secondary-500 file:text-white hover:file:bg-secondary-600 mt-2"/>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="meta-status" className={labelClasses}>Trạng thái</label>
                        <select id="meta-status" value={story.status} onChange={e => handleFieldChange('status', e.target.value)} className={inputClasses}>
                            <option value="Ongoing">Đang tiến hành</option>
                            <option value="Completed">Đã hoàn thành</option>
                            <option value="Dropped">Đã drop</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClasses}>Truyện hot</label>
                        <button onClick={() => handleFieldChange('hot', !story.hot)} className={`w-full p-2 text-sm rounded-md ${story.hot ? 'bg-accent-500 text-white' : 'bg-primary-200 dark:bg-primary-700'}`}>
                            {story.hot ? 'Có' : 'Không'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );

    const renderVolumeFields = () => {
        const volume = entity as Volume;
        if (!volume) return null;
        return (
            <>
                <h3 className="text-lg font-bold font-serif">Siêu dữ liệu tập</h3>
                <div className="mt-4 space-y-4">
                    <div><label className={labelClasses}>Tiêu đề</label><input type="text" value={volume.title} onChange={e => handleTitleChange(e.target.value)} className={inputClasses}/></div>
                     <div>
                        <label className={labelClasses}>Ảnh bìa (Tùy chọn)</label>
                        {volume.coverImageUrl && <img src={volume.coverImageUrl} alt="cover" className="max-h-32 rounded-md my-2"/>}
                        <input type="text" placeholder="URL hình ảnh" value={volume.coverImageUrl && !volume.coverImageUrl.startsWith('data:') ? volume.coverImageUrl : ''} onChange={e => handleFieldChange('coverImageUrl', e.target.value)} className={inputClasses}/>
                        <input type="file" accept="image/*" onChange={handleCoverImageUpload} className="w-full text-xs text-primary-600 dark:text-primary-400 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-secondary-500 file:text-white hover:file:bg-secondary-600 mt-2"/>
                    </div>
                </div>
            </>
        );
    };

    const renderChapterFields = () => {
        const chapter = entity as StoryChapter;
        if (!chapter) return null;
        return (
            <>
                <h3 className="text-lg font-bold font-serif">Siêu dữ liệu chương</h3>
                <div className="mt-4">
                    <label className={labelClasses}>Tiêu đề</label>
                    <input type="text" value={chapter.title} onChange={e => handleTitleChange(e.target.value)} className={inputClasses}/>
                </div>
            </>
        );
    };

    if (!entity) return <div className="p-4 text-sm text-primary-500">Chọn một mục để chỉnh sửa siêu dữ liệu của nó.</div>;

    return (
        <div className="p-4 sm:p-6 h-full">
            {selectedItem.type === 'story' && renderStoryFields()}
            {selectedItem.type === 'volume' && renderVolumeFields()}
            {selectedItem.type === 'chapter' && renderChapterFields()}
        </div>
    );
};

export default MetadataPanel;