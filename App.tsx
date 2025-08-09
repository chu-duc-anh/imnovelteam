

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Story, User, Volume, StoryChapter, Comment, ContentBlock, ContentBlockText, ContentBlockImage, ChatThread, LeaderboardUser, SiteSetting } from './types';
import { createText, createVolume, createChapter, createImage, DEFAULT_AVATAR_URL } from './constants';
import { generateId, toAbsoluteUrl } from './utils';
import Navbar from './components/Navbar';
import StoryList from './components/StoryList';
import StoryDetailView from './components/StoryDetailView';
import LoadingSpinner from './components/LoadingSpinner';
import Modal from './components/Modal';
import AuthView from './components/Auth/AuthView';
import ChangePasswordModal from './components/Auth/ChangePasswordModal';
import StoryEditView from './components/Admin/StoryEditView';
import UserManagementView from './components/Admin/UserManagementView';
import MyStoriesView from './components/MyStoriesView';
import ChapterView from './components/ChapterView'; 
import UserProfileView from './components/UserProfileView';
import AdminChatWidget from './components/AdminChatWidget';
import { authService } from './services/authService';
import { dataService } from './services/dataService';
import { chatService } from './services/chatService';
import ChatView from './components/ChatView';
import FloatingChatButton from './components/FloatingChatButton';
import Leaderboard from './components/Leaderboard';
import StoryHub from './components/StoryHub';
import AllyManagementView from './components/AllyManagementView';
import TeamStoriesView from './components/TeamStoriesView';
import ScrollToTopButton from './components/ScrollToTopButton';
import SiteSettingsView from './components/Admin/SiteSettingsView';
import DynamicBackground from './components/DynamicBackground';
import BackgroundPreviewView from './components/BackgroundPreviewView';
import SocialLinks from './components/SocialLinks';
import BackgroundMusicPlayer from './components/BackgroundMusicPlayer';

const THEME_KEY = 'ai_story_teller_theme';
const PROSE_SIZE_KEY = 'imnovel_prose_size';
const STORIES_PER_PAGE = 8;

type View = 'mainList' | 'storyDetail' | 'chapterView' | 'userProfile' | 'userManagement' | 'chat' | 'auth' | 'storyEdit' | 'myStories' | 'allyManagement' | 'teamStories' | 'siteSettings' | 'backgroundPreview';
type AuthMode = 'login' | 'register' | 'forgot' | 'reset';
type Theme = 'light' | 'dark';
type StatusFilter = 'all' | 'Ongoing' | 'Completed' | 'Dropped';

const PROSE_CLASSES = ['prose-sm', 'prose-base', 'prose-lg', 'prose-xl', 'prose-2xl', 'prose-3xl', 'prose-4xl'];

const App: React.FC = () => {
  const [paginatedStories, setPaginatedStories] = useState<Story[]>([]);
  const [hotStories, setHotStories] = useState<Story[]>([]);
  const [recentStories, setRecentStories] = useState<Story[]>([]);
  const [managementStories, setManagementStories] = useState<Story[]>([]);

  const [comments, setComments] = useState<Comment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>([]);
  const [theme, setTheme] = useState<Theme>('dark');
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [siteSettings, setSiteSettings] = useState<SiteSetting[]>([]);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  const [currentView, setCurrentView] = useState<View>('mainList');
  const [previousView, setPreviousView] = useState<View>('mainList');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [selectedVolumeId, setSelectedVolumeId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);

  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true);
  const [isFetchingList, setIsFetchingList] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoModal, setInfoModal] = useState<{isOpen: boolean, title: string, message: string, showFireworks?: boolean} | null>(null);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
  } | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [authViewProps, setAuthViewProps] = useState({ initialMode: 'login' as AuthMode, resetToken: null as string | null });
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const [storyInEditSession, setStoryInEditSession] = useState<Story | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState<{ [key: string]: 'include' | 'exclude' }>({});
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [proseSizeClass, setProseSizeClass] = useState('prose-lg');
  
  const fetchInitialStaticData = useCallback(async (user: User | null) => {
      try {
        const [fetchedComments, publicUsers, leaderboardData, fetchedSettings, fetchedHot, fetchedRecent] = await Promise.all([
          dataService.getComments(),
          authService.getPublicUsers(),
          authService.getLeaderboard(),
          dataService.getSiteSettings(),
          dataService.getHotStories(),
          dataService.getRecentStories(),
        ]);
        setComments(fetchedComments);
        setLeaderboardUsers(leaderboardData);
        setUsers(publicUsers);
        setSiteSettings(fetchedSettings);
        setHotStories(fetchedHot);
        setRecentStories(fetchedRecent);

        if (user) {
            if (user.role === 'admin' || user.role === 'contractor') {
                const fullUsers = await authService.getAllUsers();
                setUsers(fullUsers);
            }
            const fetchedThreads = await chatService.getThreads();
            setChatThreads(fetchedThreads);
        } else {
            setChatThreads([]);
        }

      } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load app data.');
      }
  }, []);

  useEffect(() => {
    const fetchPaginatedStories = async () => {
      setIsFetchingList(true);
      try {
        const includeGenres = Object.keys(genreFilter).filter(g => genreFilter[g] === 'include');
        const excludeGenres = Object.keys(genreFilter).filter(g => genreFilter[g] === 'exclude');

        const data = await dataService.getStories({
          page: currentPage,
          limit: STORIES_PER_PAGE,
          search: searchTerm,
          status: statusFilter,
          genresInclude: includeGenres,
          genresExclude: excludeGenres,
        });

        setPaginatedStories(data.stories);
        setTotalPages(data.pages);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load stories.");
      } finally {
        setIsFetchingList(false);
      }
    };

    if(!isLoadingInitial) fetchPaginatedStories();
  }, [currentPage, searchTerm, genreFilter, statusFilter, isLoadingInitial]);

  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_KEY) as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(storedTheme || (prefersDark ? 'dark' : 'light'));
    
    const storedProseSize = localStorage.getItem(PROSE_SIZE_KEY) as (typeof PROSE_CLASSES)[number] | null;
    if (storedProseSize && PROSE_CLASSES.includes(storedProseSize)) {
      setProseSizeClass(storedProseSize);
    }

    const checkAuthAndFetchData = async () => {
      setIsLoadingInitial(true);
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
      await fetchInitialStaticData(user);
      setIsLoadingInitial(false);

      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('resetToken');
      if (token) {
          window.history.replaceState({}, document.title, window.location.pathname);
          setAuthViewProps({ initialMode: 'reset', resetToken: token });
          setCurrentView('auth');
      }
    }

    checkAuthAndFetchData();
    
  }, [fetchInitialStaticData]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
      localStorage.setItem(PROSE_SIZE_KEY, proseSizeClass);
  }, [proseSizeClass]);
  
  useEffect(() => {
    setCurrentPage(1); 
  }, [searchTerm, genreFilter, statusFilter]);
  
  useEffect(() => {
    if (currentUser && chatThreads.length > 0) {
        const adminThread = chatThreads.find(t => t.id === 'admin-user-01');
        const userThread = chatThreads.find(t => t.id === currentUser.id);

        if (currentUser.role === 'admin') {
            const totalUnread = chatThreads.reduce((acc, thread) => {
                const unreadCount = thread.messages.filter(m => m.receiverId === currentUser.id && !m.isRead).length;
                return acc + unreadCount;
            }, 0);
            setUnreadChatCount(totalUnread);
        } else if(userThread) {
            const unreadCount = userThread.messages.filter(m => m.receiverId === currentUser.id && !m.isRead).length;
            setUnreadChatCount(unreadCount);
        } else {
            setUnreadChatCount(0);
        }
    } else {
        setUnreadChatCount(0);
    }
}, [chatThreads, currentUser]);

  useEffect(() => {
    const isAnyModalOpen =
      showChangePasswordModal ||
      !!error ||
      infoModal?.isOpen ||
      confirmationModal?.isOpen;

    const htmlElement = document.documentElement;

    if (isAnyModalOpen || currentView === 'storyEdit') {
      htmlElement.style.overflow = 'hidden';
    } else {
      htmlElement.style.overflow = 'auto';
    }

    return () => {
      htmlElement.style.overflow = 'auto';
    };
  }, [
    showChangePasswordModal,
    error,
    infoModal,
    confirmationModal,
    currentView
  ]);
  
  const handleAuthSuccess = async (user: User) => {
     setCurrentUser(user);
     await fetchInitialStaticData(user);
     setCurrentView('mainList');
     setAuthViewProps({ initialMode: 'login', resetToken: null });
  };
  
  const handleRegisterSuccess = (user: User) => {
     setInfoModal({
        isOpen: true,
        title: "Registration Successful!",
        message: "Your account has been created. Please log in to continue.",
     });
  }
  
  const showAuthView = (mode: 'login' | 'register') => {
    setAuthViewProps({ initialMode: mode, resetToken: null });
    setCurrentView('auth');
  };
  
  const showMainList = useCallback(() => {
    setCurrentView('mainList');
    setSelectedStory(null);
    setSelectedVolumeId(null);
    setSelectedChapterId(null);
    window.scrollTo(0, 0);
  }, []);

  const showStoryDetail = useCallback((story: Story, volumeIdToSelect: string | null = null) => {
    setSelectedStory(story);
    setSelectedVolumeId(volumeIdToSelect);
    setCurrentView('storyDetail');
    setSelectedChapterId(null); 
    window.scrollTo(0, 0);
  }, []);

  const handleSelectStoryFromList = useCallback((story: Story) => {
    showStoryDetail(story, null);
  }, [showStoryDetail]);
  
  const showUserProfile = useCallback(() => { if (currentUser) { setCurrentView('userProfile'); window.scrollTo(0, 0); } }, [currentUser]);
  const showUserManagement = useCallback(() => { if (currentUser?.role === 'admin') { setCurrentView('userManagement'); window.scrollTo(0, 0); } }, [currentUser]);
  
  const showMyStories = useCallback(async () => {
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'contractor')) return;
    setIsFetchingList(true);
    const creatorId = currentUser.role === 'admin' ? undefined : currentUser.id;
    const { stories } = await dataService.getStories({ creatorId, limit: 1000 }); // High limit for "all"
    setManagementStories(stories);
    setIsFetchingList(false);
    setCurrentView('myStories');
    window.scrollTo(0, 0);
  }, [currentUser]);

  const showTeamStories = useCallback(async () => {
    if (!currentUser?.allyOf) return;
    setIsFetchingList(true);
    const { stories } = await dataService.getStories({ creatorId: currentUser.allyOf.id, limit: 1000 });
    setManagementStories(stories);
    setIsFetchingList(false);
    setCurrentView('teamStories');
    window.scrollTo(0, 0);
  }, [currentUser]);

  const showAllyManagement = useCallback(() => { if (currentUser?.role === 'contractor') { setCurrentView('allyManagement'); window.scrollTo(0, 0); } }, [currentUser]);
  const showSiteSettings = useCallback(() => { if (currentUser?.role === 'admin') { setCurrentView('siteSettings'); window.scrollTo(0, 0); } }, [currentUser]);

  const handleShowBackgroundPreview = useCallback(() => {
    setPreviousView(currentView);
    setCurrentView('backgroundPreview');
    window.scrollTo(0, 0);
  }, [currentView]);

  const handleSelectVolume = useCallback((volumeId: string | null) => { setSelectedVolumeId(volumeId); setSelectedChapterId(null); window.scrollTo(0,0); }, []);
  const showChatView = useCallback(() => { if (!currentUser) { showAuthView('login'); return; } setCurrentView('chat'); }, [currentUser]);
  const handleBackFromChat = useCallback(() => { setCurrentView('mainList'); }, []);

  const showChapterView = useCallback((volumeId: string, chapterId: string) => {
    if (selectedStory) {
      const volume = selectedStory.volumes.find(v => v.id === volumeId);
      if (volume && volume.chapters.find(ch => ch.id === chapterId)) {
        setSelectedVolumeId(volumeId);
        setSelectedChapterId(chapterId);
        setCurrentView('chapterView');
        window.scrollTo(0, 0);
      } else {
        setError(`Chapter or Volume not found. Returning to story details.`);
        showStoryDetail(selectedStory, volumeId); 
      }
    } else {
      setError(`Story not found. Returning to main list.`);
      showMainList();
    }
  }, [selectedStory, showMainList, showStoryDetail]);
  
  const navigateChapterInView = useCallback((direction: 'prev' | 'next') => {
    if (!selectedStory || !selectedVolumeId || !selectedChapterId) return;
    const volume = selectedStory.volumes.find(v => v.id === selectedVolumeId);
    if (!volume || !volume.chapters || volume.chapters.length === 0) return;
    const currentIndex = volume.chapters.findIndex(ch => ch.id === selectedChapterId);
    if (currentIndex === -1) return;
    let nextChapter: StoryChapter | undefined;
    if (direction === 'next' && currentIndex < volume.chapters.length - 1) nextChapter = volume.chapters[currentIndex + 1];
    else if (direction === 'prev' && currentIndex > 0) nextChapter = volume.chapters[currentIndex - 1];
    if (nextChapter) { setSelectedChapterId(nextChapter.id); window.scrollTo(0,0); }
  }, [selectedStory, selectedVolumeId, selectedChapterId]);

  const handleChapterSelection = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    window.scrollTo(0, 0);
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    await fetchInitialStaticData(null); 
    showMainList(); 
  };
  
  const handleUpdatePassword = async (oldPassword: string, newPassword: string) => {
    if (!currentUser) throw new Error("Not logged in.");
    await authService.updateUserPassword(oldPassword, newPassword);
    setInfoModal({ isOpen: true, title: "Success", message: "Your password has been updated." });
    setShowChangePasswordModal(false);
  };
  
  const handleStartEditSession = useCallback((story?: Story) => {
    const canCreate = currentUser?.role === 'admin' || currentUser?.role === 'contractor';

    if (!story) {
        if (!canCreate) {
            setError("Đồng minh không thể tạo truyện mới. Chỉ admin hoặc nhà thầu mới có thể tạo truyện mới.");
            return;
        }
        if (!currentUser) {
            setError("Bạn phải đăng nhập để tạo truyện.");
            return;
        }
        const newStory: Story = {
            id: '', 
            creatorId: { id: currentUser.id, username: currentUser.username },
            title: '',
            author: currentUser.name || currentUser.username,
            coverImageUrl: '',
            genres: [],
            alternativeTitles: [],
            description: '',
            volumes: [createVolume('Volume 1')],
            status: 'Ongoing',
            isRecent: true,
            hot: false,
            lastUpdated: Date.now()
        };
        setStoryInEditSession(newStory);
    } else {
        const isOwner = story.creatorId?.id === currentUser?.id;
        const isAlly = currentUser?.allyOf?.id === story.creatorId?.id;

        if (currentUser?.role !== 'admin' && !isOwner && !isAlly) {
            setError("Bạn không có quyền chỉnh sửa truyện này.");
            return;
        }
        setStoryInEditSession(JSON.parse(JSON.stringify(story)));
    }
    
    setCurrentView('storyEdit');
  }, [currentUser]);

  const handleCancelEditSession = useCallback(() => {
    setStoryInEditSession(null);
    if(currentView === 'storyEdit') {
        showMainList();
    }
  }, [currentView, showMainList]);

  const handleSaveEditedStory = useCallback(async (editedStory: Story) => {
    if (currentUser?.role !== 'admin' && currentUser?.role !== 'contractor' && !currentUser?.allyOf) {
      setError("You are not authorized to save stories.");
      return;
    }
    try {
      const savedStory = await dataService.saveStory(editedStory);
      setHotStories(await dataService.getHotStories());
      setRecentStories(await dataService.getRecentStories());
      setStoryInEditSession(null);
      showStoryDetail(savedStory);
    } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while saving the story.");
    }
  }, [currentUser, showStoryDetail]);

  const handleDeleteStory = (storyId: string) => {
     if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'contractor' && !currentUser.allyOf)) { setError("You are not authorized."); return; }
     const storyToDelete = paginatedStories.find(s=>s.id === storyId) || managementStories.find(s => s.id === storyId);
     if (!storyToDelete) { setError("Story not found for deletion."); return; }
    
     setConfirmationModal({
      isOpen: true,
      title: "Confirm Deletion",
      message: `Are you sure you want to delete "${storyToDelete.title}"? This cannot be undone.`,
      onConfirm: async () => {
        await dataService.deleteStory(storyId);
        // Refetch relevant lists
        if(currentView === 'mainList') {
          const data = await dataService.getStories({ page: currentPage, limit: STORIES_PER_PAGE, search: searchTerm, status: statusFilter, genresInclude: Object.keys(genreFilter).filter(g=>genreFilter[g]==='include'), genresExclude: Object.keys(genreFilter).filter(g=>genreFilter[g]==='exclude') });
          setPaginatedStories(data.stories);
          setTotalPages(data.pages);
        } else if (currentView === 'myStories') {
          showMyStories();
        } else if (currentView === 'teamStories') {
          showTeamStories();
        }
        setHotStories(await dataService.getHotStories());
        setRecentStories(await dataService.getRecentStories());

        setComments(prev => prev.filter(c => c.storyId !== storyId));
        if (selectedStory?.id === storyId) {
            showMainList();
        }
        setConfirmationModal(null);
      }
    });
  };

  const handleAddComment = useCallback(async (storyId: string, text: string, parentId: string | null = null, chapterId: string | null = null) => {
    if (!currentUser) { setError("You must be logged in to comment."); throw new Error("User not logged in."); }
    if (!text.trim()) { throw new Error("Comment cannot be empty."); }
    
    try {
        const newCommentData = {
          storyId, chapterId, parentId,
          text: text.trim(),
        };
        const savedComment = await dataService.addComment(newCommentData);
        setComments(prev => [...prev, savedComment]);
    } catch (err) {
        console.error("Failed to add comment:", err);
        setError(err instanceof Error ? err.message : "Failed to post comment.");
        throw err;
    }
  }, [currentUser]);

  const handleToggleCommentLike = useCallback(async (commentId: string) => {
    if (!currentUser) { showAuthView('login'); return; }
    const updatedComment = await dataService.toggleCommentLike(commentId);
    setComments(prev => prev.map(c => c.id === commentId ? updatedComment : c));
  }, [currentUser]);

  const handleDeleteComment = useCallback((commentId: string) => {
    setConfirmationModal({
      isOpen: true,
      title: "Xác nhận xóa",
      message: "Bạn có chắc chắn muốn xóa bình luận này không? Hành động này không thể hoàn tác.",
      confirmText: "Có",
      cancelText: "Không",
      onConfirm: async () => {
        await dataService.deleteComment(commentId);
        setComments(prev => prev.filter(c => c.id !== commentId));
        setConfirmationModal(null);
      },
    });
  }, []);

  const handleTogglePinComment = useCallback(async (commentId: string) => {
    if (currentUser?.role !== 'admin') { setError("Only admins can pin comments."); return; }
    const updatedComment = await dataService.togglePinComment(commentId);
    setComments(prev => prev.map(c => c.id === commentId ? updatedComment : c));
  }, [currentUser]);
  
  const handleToggleBookmark = useCallback(async (storyId: string) => {
    if (!currentUser) { showAuthView('login'); return; }
    try {
        const updatedStory = await dataService.toggleBookmark(storyId);
        if (selectedStory?.id === storyId) setSelectedStory(updatedStory);
        setPaginatedStories(prev => prev.map(s => s.id === storyId ? updatedStory : s));
    } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update bookmark.");
    }
  }, [currentUser, selectedStory?.id]);

  const handleToggleStoryLike = useCallback(async (storyId: string) => {
    if (!currentUser) { showAuthView('login'); return; }
    try {
        const updatedStory = await dataService.toggleStoryLike(storyId);
        if (selectedStory?.id === storyId) setSelectedStory(updatedStory);
        setPaginatedStories(prev => prev.map(s => s.id === storyId ? updatedStory : s));
    } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update like status.");
    }
  }, [currentUser, selectedStory?.id]);

  const handleRateStory = useCallback(async (storyId: string, score: number) => {
    if (!currentUser) { showAuthView('login'); return; }
    try {
        const updatedStory = await dataService.submitStoryRating(storyId, score);
        if (selectedStory?.id === storyId) setSelectedStory(updatedStory);
        setPaginatedStories(prev => prev.map(s => s.id === storyId ? updatedStory : s));
        setInfoModal({isOpen: true, title: "Cảm ơn bạn!", message: "Đánh giá của bạn đã được ghi nhận."})
    } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to submit rating.");
        throw err;
    }
  }, [currentUser, selectedStory?.id]);
  
  const handleSendMessage = async (text: string, receiverId: string) => {
    if (!currentUser) throw new Error("User not logged in.");
    await chatService.sendMessage(text, receiverId);
    setChatThreads(await chatService.getThreads());
  };
  
  const handleMarkMessagesAsRead = async (threadUserId: string) => {
    if (!currentUser) return;
    await chatService.markMessagesAsRead(threadUserId);
    setChatThreads(await chatService.getThreads());
  };
  
  const handleDeleteThread = (threadId: string) => {
    if (currentUser?.role !== 'admin') {
      setError("You are not authorized to delete conversations.");
      return;
    }
    const threadToDelete = chatThreads.find(t => t.id === threadId);
    if (!threadToDelete) return;

    setConfirmationModal({
        isOpen: true,
        title: "Xóa cuộc trò chuyện",
        message: `Bạn có chắc chắn muốn xóa toàn bộ cuộc trò chuyện với "${threadToDelete.userName}" không? Hành động này không thể hoàn tác.`,
        confirmText: "Xóa",
        cancelText: "Hủy",
        onConfirm: async () => {
            try {
                await chatService.deleteThread(threadId);
                setChatThreads(prev => prev.filter(t => t.id !== threadId));
            } catch (err) {
                setError(err instanceof Error ? err.message : "Không thể xóa cuộc trò chuyện.");
            } finally {
                setConfirmationModal(null);
            }
        },
    });
  };

  const handleUpdateAvatar = async (newAvatarDataUrl: string) => {
    if (!currentUser) throw new Error("User not logged in.");
    const updatedUser = await authService.updateUserAvatar(currentUser.id, newAvatarDataUrl);
    setCurrentUser(updatedUser);
  };
  
  const handleUpdateRace = async (newRace: string) => {
    if (!currentUser) throw new Error("User not logged in.");
    if (currentUser.race === newRace) return;
    setConfirmationModal({
      isOpen: true,
      title: "Xác nhận đổi chủng loài",
      message: "Bạn có chắc chắn muốn đổi chủng loài không?",
      confirmText: "Có",
      cancelText: "Không",
      onConfirm: async () => {
        setConfirmationModal(null);
        const updatedUser = await authService.updateUserRace(currentUser.id, newRace);
        setCurrentUser(updatedUser);
        setInfoModal({ isOpen: true, title: "Đã đổi chủng loài", message: `Chủng loài của bạn đã được cập nhật thành ${newRace}.` });
      },
    });
  };

  const handleUpdateUserRole = async (userId: string, newRole: 'user' | 'admin' | 'contractor') => {
      if (currentUser?.role !== 'admin' || currentUser.id === userId) { setError("Action not permitted."); return; }
      await authService.updateUserRole(userId, newRole);
      setUsers(await authService.getAllUsers());
  };

  const handleDeleteUser = (userId: string) => {
      if (currentUser?.role !== 'admin' || currentUser.id === userId) { setError("Action not permitted."); return; }
      const userToDelete = users.find(u => u.id === userId);
      if (!userToDelete) return;
      setConfirmationModal({
          isOpen: true,
          title: "Confirm User Deletion",
          message: `Are you sure you want to delete "${userToDelete.username}"? This will also remove all their comments and cannot be undone.`,
          onConfirm: async () => {
              await authService.deleteUser(userId);
              setUsers(await authService.getAllUsers());
              setComments(prev => prev.filter(c => c.userId.id !== userId));
              setConfirmationModal(null);
          }
      });
  };
  
  const handleManageAlly = async (action: 'add' | 'remove', allyUsername: string) => {
    if (!currentUser || currentUser.role !== 'contractor') {
      throw new Error("Only contractors can manage allies.");
    }
    await authService.manageAlly(action, allyUsername);
    setUsers(await authService.getAllUsers());
  };

  const handleLeaveAllyTeam = () => {
    if (!currentUser || !currentUser.allyOf) return;
    setConfirmationModal({
        isOpen: true,
        title: "Xác nhận rời team",
        message: "Bạn có chắc chắn muốn rời khỏi team không? Bạn sẽ mất quyền chỉnh sửa truyện của team.",
        confirmText: "Rời team",
        onConfirm: async () => {
            try {
                const updatedUser = await authService.leaveAllyTeam();
                setCurrentUser(updatedUser);
                setInfoModal({ isOpen: true, title: "Thành công", message: "Bạn đã rời khỏi team." });
            } catch(err) {
                setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
            } finally {
                setConfirmationModal(null);
            }
        },
    });
  };

  const handleSaveSiteSettings = async (settingsToSave: Omit<SiteSetting, 'id'>[]) => {
      if (currentUser?.role !== 'admin') {
          setError("You are not authorized to change site settings.");
          return;
      }
      try {
          const updatedSettings = await dataService.updateSiteSettings(settingsToSave);
          setSiteSettings(updatedSettings);
          setInfoModal({ isOpen: true, title: "Success", message: "Site settings have been updated successfully." });
          setCurrentView('mainList');
      } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to save settings.");
      }
  };

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  const toggleMusic = () => setIsMusicPlaying(prev => !prev);
  const handleCloseErrorModal = () => setError(null);
  const handleCloseInfoModal = () => setInfoModal(null);
  const handleCloseConfirmationModal = () => setConfirmationModal(null);
  const handleConfirmModalAction = () => { if (confirmationModal) confirmationModal.onConfirm(); };

  const handleGenreFilterChange = (genre: string) => {
    if (genre === '') {
      setGenreFilter({});
      return;
    }

    setGenreFilter(prevFilter => {
      const newFilter = { ...prevFilter };
      const currentState = newFilter[genre];

      if (currentState === 'include') {
        newFilter[genre] = 'exclude';
      } else if (currentState === 'exclude') {
        delete newFilter[genre];
      } else {
        newFilter[genre] = 'include';
      }
      return newFilter;
    });
  };
  
  const handleProseSizeChange = (direction: 'increase' | 'decrease') => {
    setProseSizeClass(currentClass => {
        const currentIndex = PROSE_CLASSES.indexOf(currentClass);
        if (direction === 'increase') {
            const newIndex = Math.min(currentIndex + 1, PROSE_CLASSES.length - 1);
            return PROSE_CLASSES[newIndex];
        } else {
            const newIndex = Math.max(currentIndex - 1, 0);
            return PROSE_CLASSES[newIndex];
        }
    });
  };
  
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0,0);
    }
  };
  
  const allGenres = useMemo(() => {
    const genreSet = new Set<string>();
    [...hotStories, ...recentStories, ...paginatedStories].forEach(s => {
        s.genres.forEach(g => genreSet.add(g));
    });
    return Array.from(genreSet).sort();
  }, [hotStories, recentStories, paginatedStories]);

  const selectedStoryComments = useMemo(() => comments.filter(c => c.storyId === selectedStory?.id), [comments, selectedStory]);
  const selectedChapterComments = useMemo(() => comments.filter(c => c.storyId === selectedStory?.id && c.chapterId === selectedChapterId), [comments, selectedStory, selectedChapterId]);
  
  const backgroundMusicUrl = useMemo(() => {
    const setting = siteSettings.find(s => s.key === 'backgroundMusic');
    return toAbsoluteUrl(setting?.value);
  }, [siteSettings]);

  if (isLoadingInitial) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" message="Loading application..." />
      </div>
    );
  }
  
  const viewsWithoutAppChrome: View[] = ['auth', 'storyEdit', 'chat', 'backgroundPreview'];
  const hasAppChrome = !viewsWithoutAppChrome.includes(currentView);

  const renderView = () => {
    switch (currentView) {
      case 'mainList': return isFetchingList && paginatedStories.length === 0 ? <LoadingSpinner size="lg" message="Fetching stories..."/> : <StoryHub hotStories={hotStories} recentStories={recentStories} paginatedStories={paginatedStories} allGenres={allGenres} genreFilter={genreFilter} statusFilter={statusFilter} currentUser={currentUser} onSelectStory={handleSelectStoryFromList} onGenreChange={handleGenreFilterChange} onStatusChange={setStatusFilter} currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />;
      case 'storyDetail': return selectedStory ? <StoryDetailView story={selectedStory} selectedVolumeId={selectedVolumeId} onSelectVolume={handleSelectVolume} onBackToMainList={showMainList} onNavigateToChapter={showChapterView} comments={selectedStoryComments} onAddComment={(storyId, text, parentId) => handleAddComment(storyId, text, parentId, null)} onToggleCommentLike={handleToggleCommentLike} currentUser={currentUser} onDeleteComment={handleDeleteComment} onTogglePinComment={handleTogglePinComment} onEditStory={handleStartEditSession} onToggleBookmark={handleToggleBookmark} onToggleLike={handleToggleStoryLike} onRateStory={handleRateStory} onLoginClick={() => showAuthView('login')} /> : (showMainList(), null);
      case 'chapterView': return selectedStory && selectedVolumeId && selectedChapterId ? <ChapterView story={selectedStory} volumeId={selectedVolumeId} chapterId={selectedChapterId} comments={selectedChapterComments} onNavigateChapter={navigateChapterInView} onGoToStoryDetail={(_, volId) => showStoryDetail(selectedStory, volId)} currentUser={currentUser} onAddComment={handleAddComment} onDeleteComment={handleDeleteComment} onToggleCommentLike={handleToggleCommentLike} onTogglePinComment={handleTogglePinComment} onLoginClick={() => showAuthView('login')} proseSizeClass={proseSizeClass} onProseSizeChange={handleProseSizeChange} onSelectChapter={handleChapterSelection}/> : (selectedStory ? showStoryDetail(selectedStory, selectedVolumeId) : showMainList(), null);
      case 'userProfile': return currentUser ? <UserProfileView currentUser={currentUser} onUpdateAvatar={handleUpdateAvatar} onUpdateRace={handleUpdateRace} onBack={showMainList} theme={theme} onShowChangePasswordModal={() => setShowChangePasswordModal(true)} onLeaveAllyTeam={handleLeaveAllyTeam} /> : (showMainList(), null);
      case 'userManagement': return currentUser?.role === 'admin' ? <UserManagementView users={users} comments={comments} currentUser={currentUser} onUpdateUserRole={handleUpdateUserRole} onDeleteUser={handleDeleteUser} onBack={showMainList}/> : (showMainList(), null);
      case 'myStories': return isFetchingList ? <LoadingSpinner size="lg" /> : (currentUser ? <MyStoriesView stories={managementStories} currentUser={currentUser} onAddNewStory={() => handleStartEditSession()} onEditStory={handleStartEditSession} onDeleteStory={handleDeleteStory} onBack={showMainList} onSelectStory={handleSelectStoryFromList} /> : (showMainList(), null));
      case 'allyManagement': return currentUser?.role === 'contractor' ? <AllyManagementView currentUser={currentUser} allUsers={users} onManageAlly={handleManageAlly} onBack={showMainList}/> : (showMainList(), null);
      case 'teamStories': return isFetchingList ? <LoadingSpinner size="lg" /> : (currentUser?.allyOf ? <TeamStoriesView stories={managementStories} currentUser={currentUser} onEditStory={handleStartEditSession} onDeleteStory={handleDeleteStory} onBack={showMainList} onSelectStory={handleSelectStoryFromList} /> : (showMainList(), null));
      case 'chat': return currentUser ? <ChatView currentUser={currentUser} chatThreads={chatThreads} onSendMessage={handleSendMessage} onMarkMessagesAsRead={handleMarkMessagesAsRead} onDeleteThread={handleDeleteThread} onBack={handleBackFromChat}/> : (showMainList(), null);
      case 'siteSettings': return currentUser?.role === 'admin' ? <SiteSettingsView initialSettings={siteSettings} onSave={handleSaveSiteSettings} onBack={showMainList} onShowBackgroundPreview={handleShowBackgroundPreview} /> : (showMainList(), null);
      case 'backgroundPreview': return <BackgroundPreviewView onBack={() => setCurrentView(previousView)} theme={theme} onToggleTheme={toggleTheme} />;
      case 'auth': return <AuthView {...authViewProps} onBack={showMainList} onLoginSuccess={handleAuthSuccess} onRegisterSuccess={handleRegisterSuccess} siteSettings={siteSettings} />;
      case 'storyEdit': return storyInEditSession ? <StoryEditView story={storyInEditSession} onSave={handleSaveEditedStory} onCancel={handleCancelEditSession} allStories={paginatedStories} /> : (showMainList(), null);
      default: return null;
    }
  };

  const showScrollToTop = hasAppChrome && currentView !== 'chapterView';
  const mainContentLayoutClass = currentView === 'mainList' ? 'lg:grid lg:grid-cols-12 lg:gap-8' : '';
  const mainElementClass = currentView === 'mainList' ? 'lg:col-span-9' : 'col-span-12';

  return (
    <div className={`min-h-screen flex flex-col ${currentView === 'chat' ? 'bg-primary-100 dark:bg-primary-950' : ''}`}>
      <DynamicBackground settings={siteSettings} theme={theme} />
      <BackgroundMusicPlayer musicUrl={backgroundMusicUrl} isPlaying={isMusicPlaying} />
      
      {hasAppChrome && <Navbar currentUser={currentUser} theme={theme} onToggleTheme={toggleTheme} onHomeClick={showMainList} onLoginClick={() => showAuthView('login')} onRegisterClick={() => showAuthView('register')} onLogoutClick={handleLogout} onSearchChange={setSearchTerm} searchTerm={searchTerm} onShowUserProfile={showUserProfile} onShowUserManagement={showUserManagement} onShowMyStories={showMyStories} onShowAllyManagement={showAllyManagement} onShowTeamStories={showTeamStories} onUpdateAvatar={handleUpdateAvatar} onShowSiteSettings={showSiteSettings} isMusicPlaying={isMusicPlaying} onToggleMusic={toggleMusic}/>}
      
      <div className="flex-grow w-full">
        {hasAppChrome ? (
          <div className={`max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 ${mainContentLayoutClass}`}>
            <main className={`py-8 sm:py-12 ${mainElementClass}`}>
              {renderView()}
            </main>
            {currentView === 'mainList' && (
              <aside className="hidden lg:block lg:col-span-3">
                <div className="sticky top-28 space-y-6">
                  <div className="bg-primary-100/95 dark:bg-primary-950/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-primary-200/50 dark:border-primary-800/50">
                    <AdminChatWidget currentUser={currentUser} unreadCount={unreadChatCount} onOpenChat={showChatView} onLoginClick={() => showAuthView('login')}/>
                  </div>
                  <div className="bg-primary-100/95 dark:bg-primary-950/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-primary-200/50 dark:border-primary-800/50">
                    <SocialLinks />
                  </div>
                  <div className="bg-primary-100/95 dark:bg-primary-950/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-primary-200/50 dark:border-primary-800/50">
                    <Leaderboard topUsers={leaderboardUsers} />
                  </div>
                </div>
              </aside>
            )}
          </div>
        ) : (
          <main>{renderView()}</main>
        )}
      </div>

      {hasAppChrome && (
        <footer className="bg-primary-100/80 dark:bg-primary-950/80 text-center p-6 text-sm text-primary-500 dark:text-primary-400 border-t border-primary-200 dark:border-primary-800">
            © {new Date().getFullYear()} IMnovel Team. All rights reserved.
            <div className="mt-4">
                <button onClick={handleShowBackgroundPreview} className="text-secondary-600 dark:text-secondary-400 hover:underline font-semibold text-xs">
                    Xem Giao diện Nền
                </button>
            </div>
        </footer>
      )}
      
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center space-y-3">
        {showScrollToTop && <ScrollToTopButton />}
        {currentUser && hasAppChrome && <FloatingChatButton unreadCount={unreadChatCount} onClick={showChatView}/>}
      </div>

      {currentUser && <ChangePasswordModal isOpen={showChangePasswordModal} onClose={() => setShowChangePasswordModal(false)} onSubmit={handleUpdatePassword} />}
      <Modal isOpen={!!error} onClose={handleCloseErrorModal} title="Operation Alert" type="error"><p>{error}</p></Modal>
      {infoModal?.isOpen && ( <Modal isOpen={infoModal.isOpen} onClose={handleCloseInfoModal} title={infoModal.title} type="success" showFireworks={infoModal.showFireworks}><p className="whitespace-pre-wrap">{infoModal.message}</p></Modal> )}
      {confirmationModal?.isOpen && (
        <Modal isOpen={confirmationModal.isOpen} onClose={handleCloseConfirmationModal} title={confirmationModal.title} type="info" footerContent={
            <>
              <button onClick={handleCloseConfirmationModal} className="px-4 py-2 mr-2 bg-primary-500 hover:bg-primary-400 dark:bg-primary-600 dark:hover:bg-primary-500 text-white text-sm font-medium rounded-md">{confirmationModal.cancelText || 'Cancel'}</button>
              <button onClick={handleConfirmModalAction} className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700">{confirmationModal.confirmText || 'Confirm'}</button>
            </>
          }
          >
          <p>{confirmationModal.message}</p>
        </Modal>
      )}
    </div>
  );
};

export default App;
