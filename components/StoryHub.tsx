import React, { useState, memo } from 'react';
import { Story, User } from '../types';
import StoryList from './StoryList';
import FeaturedStorySection from './FeaturedStorySection';

interface StoryHubProps {
  hotStories: Story[];
  recentStories: Story[];
  paginatedStories: Story[];
  allGenres: string[];
  genreFilter: { [key: string]: 'include' | 'exclude' };
  statusFilter: 'all' | 'Ongoing' | 'Completed' | 'Dropped';
  currentUser: User | null;
  onSelectStory: (story: Story) => void;
  onGenreChange: (genre: string) => void;
  onStatusChange: (status: 'all' | 'Ongoing' | 'Completed' | 'Dropped') => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

type HubTab = 'all' | 'hot' | 'recent';
type StatusFilter = 'all' | 'Ongoing' | 'Completed' | 'Dropped';

const StoryHub: React.FC<StoryHubProps> = ({
  hotStories,
  recentStories,
  paginatedStories,
  allGenres,
  genreFilter,
  statusFilter,
  currentUser,
  onSelectStory,
  onGenreChange,
  onStatusChange,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const [activeTab, setActiveTab] = useState<HubTab>('all');
  const isAdmin = currentUser?.role === 'admin';

  const tabButtonStyle = (tab: HubTab) => {
    const base = "px-4 py-2.5 sm:px-6 text-sm sm:text-base font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-primary-900 focus:ring-secondary-500";
    if (activeTab === tab) {
      return `${base} bg-secondary-500 text-white shadow-lg shadow-secondary-500/30`;
    }
    return `${base} bg-primary-200/70 dark:bg-primary-800/70 text-primary-700 dark:text-primary-300 hover:bg-primary-300/70 dark:hover:bg-primary-700/70`;
  };
  
  const statusButtonClasses = (isActive: boolean) => {
      const base = 'px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-primary-900';
      if (isActive) {
          return `${base} bg-secondary-500 text-white shadow-md ring-secondary-500`;
      }
      return `${base} bg-primary-200 dark:bg-primary-700 text-primary-700 dark:text-primary-200 hover:bg-primary-300 dark:hover:bg-primary-600`;
  }

  const statusOptions: { id: StatusFilter, label: string }[] = [
      { id: 'all', label: 'Tất cả' },
      { id: 'Ongoing', label: 'Đang tiến hành' },
      { id: 'Completed', label: 'Đã hoàn thành' },
      { id: 'Dropped', label: 'Đã drop' },
  ];

  return (
    <div className="bg-primary-100/95 dark:bg-primary-950/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-primary-200/50 dark:border-primary-800/50 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b border-primary-200/80 dark:border-primary-800/80 pb-6">
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary-800 dark:text-primary-100 text-center sm:text-left">
          Khám Phá Truyện
        </h2>
      </div>

      <div className="flex justify-center sm:justify-start space-x-2 sm:space-x-4 mb-8">
        <button onClick={() => setActiveTab('all')} className={tabButtonStyle('all')}>Tổng hợp</button>
        <button onClick={() => setActiveTab('hot')} className={tabButtonStyle('hot')}>🔥 Truyện Hot</button>
        <button onClick={() => setActiveTab('recent')} className={tabButtonStyle('recent')}>🆕 Mới Cập Nhật</button>
      </div>
      
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <div className="p-4 bg-white/50 dark:bg-primary-900/50 rounded-xl shadow-md border border-primary-200/50 dark:border-primary-800/50">
            <h3 className="text-lg font-semibold text-primary-800 dark:text-primary-200 mb-2">Lọc theo trạng thái:</h3>
            <div className="flex flex-wrap gap-2">
                 {statusOptions.map(option => (
                     <button
                        key={option.id}
                        onClick={() => onStatusChange(option.id)}
                        className={statusButtonClasses(statusFilter === option.id)}
                    >
                        {option.label}
                    </button>
                 ))}
            </div>
        </div>
        <div className="p-4 bg-white/50 dark:bg-primary-900/50 rounded-xl shadow-md border border-primary-200/50 dark:border-primary-800/50">
            <h3 className="text-lg font-semibold text-primary-800 dark:text-primary-200 mb-2">Lọc theo thể loại:</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onGenreChange('')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-primary-900 ${
                  Object.keys(genreFilter).length === 0
                    ? 'bg-secondary-500 text-white shadow-md ring-secondary-500' 
                    : 'bg-primary-200 dark:bg-primary-700 text-primary-700 dark:text-primary-200 hover:bg-primary-300 dark:hover:bg-primary-600'
                }`}
              >
                Tất cả thể loại
              </button>
              {allGenres.map((genre) => {
                const state = genreFilter[genre];
                let stateClasses = '';
                if (state === 'include') {
                    stateClasses = 'bg-green-500 text-white shadow-md ring-2 ring-green-500';
                } else if (state === 'exclude') {
                    stateClasses = 'bg-red-500 text-white shadow-md ring-2 ring-red-500';
                } else {
                    stateClasses = 'bg-primary-200 dark:bg-primary-700 text-primary-700 dark:text-primary-200 hover:bg-primary-300 dark:hover:bg-primary-600';
                }

                return (
                  <button
                    key={genre}
                    onClick={() => onGenreChange(genre)}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-offset-2 dark:focus:ring-offset-primary-900 ${stateClasses}`}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-primary-500 dark:text-primary-400 mt-3">
              <strong>Gợi ý:</strong> Bấm 1 lần: <span className="text-green-600 dark:text-green-400 font-semibold">Chọn</span>, 2 lần: <span className="text-red-600 dark:text-red-400 font-semibold">Loại trừ</span>, 3 lần: Bỏ.
            </p>
        </div>
      </div>


      <div className="animate-fade-in-fast">
        {activeTab === 'all' && (
          <StoryList
            stories={paginatedStories}
            currentUser={currentUser}
            onSelectStory={onSelectStory}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
        {activeTab === 'hot' && (
           <StoryList
            stories={hotStories}
            currentUser={currentUser}
            onSelectStory={onSelectStory}
            currentPage={1}
            totalPages={1}
            onPageChange={() => {}}
          />
        )}
        {activeTab === 'recent' && (
          <StoryList
            stories={recentStories}
            currentUser={currentUser}
            onSelectStory={onSelectStory}
            currentPage={1}
            totalPages={1}
            onPageChange={() => {}}
          />
        )}
      </div>
      <style>{`
        @keyframes fade-in-fast {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-fast { animation: fade-in-fast 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default memo(StoryHub);
