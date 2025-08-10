import React, { useState, useEffect, useRef } from 'react';
import { SimplifiedStory } from '../types';
import { dataService } from '../services/dataService';
import { toAbsoluteUrl } from '../utils';
import LoadingSpinner from './LoadingSpinner';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStory: (story: SimplifiedStory) => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose, onSelectStory }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<SimplifiedStory[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setSearchTerm('');
            setResults([]);
        }
    }, [isOpen]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);
        
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        if (term.trim().length < 2) {
            setResults([]);
            setIsLoading(false);
            return;
        }
        
        setIsLoading(true);
        debounceTimeout.current = setTimeout(async () => {
            try {
                const searchResults = await dataService.searchStories(term);
                setResults(searchResults);
            } catch (error) {
                console.error("Search failed:", error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 300); // 300ms debounce
    };

    const highlightMatch = (text: string, term: string): React.ReactNode => {
        if (!term) return text;
        const regex = new RegExp(`(${term})`, 'gi');
        return text.split(regex).map((part, index) => 
            regex.test(part) ? <mark key={index} className="bg-yellow-300 dark:bg-yellow-500 text-black rounded">{part}</mark> : part
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-primary-950/70 backdrop-blur-sm z-[100] flex justify-center p-4 pt-[10vh]" onClick={onClose}>
            <div className="w-full max-w-2xl bg-primary-100 dark:bg-primary-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-down" onClick={e => e.stopPropagation()}>
                <div className="flex items-center p-2 border-b border-primary-300 dark:border-primary-700">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-primary-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" /></svg>
                        </div>
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="Type to search for stories..."
                            className="w-full pl-11 pr-4 py-3 bg-transparent border-0 rounded-lg focus:outline-none focus:ring-0 text-primary-900 dark:text-primary-100 placeholder-primary-500"
                        />
                    </div>
                    <button onClick={onClose} className="ml-2 px-4 py-2 text-sm font-semibold rounded-lg hover:bg-primary-200 dark:hover:bg-primary-800 text-primary-700 dark:text-primary-200 transition-colors">Cancel</button>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {isLoading && <div className="p-8 flex justify-center"><LoadingSpinner /></div>}
                    {!isLoading && searchTerm.trim().length > 1 && results.length === 0 && (
                        <div className="p-8 text-center text-primary-500">No results found for "{searchTerm}".</div>
                    )}
                    {results.length > 0 && (
                        <ul>
                            {searchTerm && (
                                <li className="px-4 py-3 border-b border-primary-200 dark:border-primary-800">
                                    <button className="w-full text-left flex items-center gap-3 text-sm text-primary-600 dark:text-primary-300 hover:text-secondary-600 dark:hover:text-secondary-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" /></svg>
                                        <span>Advanced search for <strong>{searchTerm}</strong></span>
                                    </button>
                                </li>
                            )}
                            {results.map(story => (
                                <li key={story.id} className="border-b border-primary-200 dark:border-primary-800">
                                    <button onClick={() => onSelectStory(story)} className="w-full text-left p-3 flex items-center gap-4 hover:bg-primary-200/50 dark:hover:bg-primary-800/50 transition-colors">
                                        <img src={toAbsoluteUrl(story.coverImageUrl)} alt={story.title} className="w-12 h-16 object-cover rounded-md flex-shrink-0 bg-primary-200 dark:bg-primary-800" />
                                        <div className="overflow-hidden">
                                            <p className="font-semibold text-primary-800 dark:text-primary-100 truncate">{highlightMatch(story.title, searchTerm)}</p>
                                            <p className="text-sm text-primary-500 dark:text-primary-400 truncate">{story.author}{story.translator ? ` / ${story.translator}` : ''}</p>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
             <style>{`
                @keyframes fade-in-down {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-down { animation: fade-in-down 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default SearchOverlay;
