import React, { useState, useMemo, useRef, useEffect } from 'react';
import { SiteSetting } from '../../types';
import { fileService } from '../../services/fileService';
import { toAbsoluteUrl } from '../../utils';
import LoadingSpinner from '../LoadingSpinner';

interface SiteSettingsViewProps {
  initialSettings: SiteSetting[];
  onSave: (settings: Omit<SiteSetting, 'id'>[]) => Promise<void>;
  onBack: () => void;
  onShowBackgroundPreview: () => void;
}

type LocalSetting = {
  value: string;
  mediaType: 'image' | 'video' | 'audio';
};

const SiteSettingsView: React.FC<SiteSettingsViewProps> = ({ initialSettings, onSave, onBack, onShowBackgroundPreview }) => {
  const getInitialLocalSetting = (key: 'backgroundLight' | 'backgroundDark' | 'authBackground' | 'backgroundMusic'): LocalSetting => {
    const setting = initialSettings.find(s => s.key === key);
    const defaultMediaType = key === 'backgroundMusic' ? 'audio' : 'image';
    return {
      value: setting?.value || '',
      mediaType: setting?.mediaType || defaultMediaType,
    };
  };

  const [lightSetting, setLightSetting] = useState<LocalSetting>(getInitialLocalSetting('backgroundLight'));
  const [darkSetting, setDarkSetting] = useState<LocalSetting>(getInitialLocalSetting('backgroundDark'));
  const [authSetting, setAuthSetting] = useState<LocalSetting>(getInitialLocalSetting('authBackground'));
  const [musicSetting, setMusicSetting] = useState<LocalSetting>(getInitialLocalSetting('backgroundMusic'));
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lightFileInputRef = useRef<HTMLInputElement>(null);
  const darkFileInputRef = useRef<HTMLInputElement>(null);
  const authFileInputRef = useRef<HTMLInputElement>(null);
  const musicFileInputRef = useRef<HTMLInputElement>(null);

  const fullMusicUrl = useMemo(() => {
    return toAbsoluteUrl(musicSetting.value);
  }, [musicSetting.value]);

  const getMediaTypeFromFile = (fileName: string): 'image' | 'video' | 'audio' => {
    const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'];
    const audioExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'aac'];
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension && videoExtensions.includes(extension)) return 'video';
    if (extension && audioExtensions.includes(extension)) return 'audio';
    return 'image';
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<LocalSetting>>, settingKey: string, allowedTypes: Array<'image' | 'video' | 'audio'>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const mediaType = getMediaTypeFromFile(file.name);
      
      if (!allowedTypes.includes(mediaType)) {
          setError(`Invalid file type for this setting. Please upload one of: ${allowedTypes.join(', ')}`);
          return;
      }

      setError(null);
      setUploading(settingKey);
      
      try {
        const backendUrl = await fileService.upload(file);
        setter({ value: backendUrl, mediaType });
      } catch (err) {
          setError(err instanceof Error ? err.message : `Failed to upload ${mediaType}.`);
      } finally {
          setUploading(null);
          // Clear the file input so the same file can be re-uploaded if needed
          if (e.target) e.target.value = '';
      }
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<LocalSetting>>) => {
    const url = e.target.value;
    const mediaType = getMediaTypeFromFile(url);
    setter({ value: url, mediaType });
  };
  
  const handleSaveSettings = async () => {
    setError(null);
    setIsSaving(true);
    try {
        const settingsPayload: Omit<SiteSetting, 'id'>[] = [
            { key: 'backgroundLight', value: lightSetting.value, mediaType: lightSetting.mediaType },
            { key: 'backgroundDark', value: darkSetting.value, mediaType: darkSetting.mediaType },
            { key: 'authBackground', value: authSetting.value, mediaType: 'image' },
            { key: 'backgroundMusic', value: musicSetting.value, mediaType: 'audio' },
        ];
        await onSave(settingsPayload);
    } catch(err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
        setIsSaving(false);
    }
  };

  const BackgroundPreview: React.FC<{ setting: LocalSetting, title: string, uploadingKey: string }> = ({ setting, title, uploadingKey }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(error => {
                console.warn("Preview video autoplay was prevented:", error);
            });
        }
    }, [setting.value]);
    
    return (
        <div className="relative w-full aspect-video bg-primary-200 dark:bg-primary-800 rounded-lg overflow-hidden shadow-inner">
        {uploading === uploadingKey && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-10">
                <LoadingSpinner message="Uploading..." />
            </div>
        )}
        {setting.value ? (
            setting.mediaType === 'image' ? (
            <img src={toAbsoluteUrl(setting.value)} alt={`${title} preview`} className="w-full h-full object-cover" />
            ) : (
            <video ref={videoRef} key={toAbsoluteUrl(setting.value)} src={toAbsoluteUrl(setting.value)} muted loop autoPlay playsInline className="w-full h-full object-cover" />
            )
        ) : (
            <div className="flex items-center justify-center h-full text-primary-500 text-sm">No background set</div>
        )}
        <div className="absolute inset-0 bg-black/20"></div>
        <h4 className="absolute bottom-2 left-3 text-white font-bold text-lg drop-shadow-md">{title}</h4>
        </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto my-8 p-4 sm:p-6 md:p-8 bg-primary-100/95 dark:bg-primary-950/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-primary-200/50 dark:border-primary-800/50">
        <div className="flex justify-between items-start mb-6">
            <h1 className="font-serif text-4xl font-bold text-primary-800 dark:text-primary-100">Cài đặt Trang web</h1>
            <button onClick={onBack} className="text-sm text-secondary-600 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300 flex items-center group">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1 group-hover:-translate-x-0.5 transition-transform"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
                 Quay lại
            </button>
        </div>

        {error && <p className="mb-4 text-center text-sm text-red-500 bg-red-100 dark:bg-red-900/50 p-2.5 rounded-lg">{error}</p>}
        
        <div className="space-y-10">
            {/* Background Music */}
            <div className="p-4 rounded-lg border border-primary-200 dark:border-primary-700/50">
                <h2 className="text-xl font-semibold font-serif text-primary-800 dark:text-primary-200 mb-4">Nhạc Nền</h2>
                <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                     <div className="space-y-4 w-full lg:w-1/2">
                        {uploading === 'backgroundMusic' ? (
                             <div className="flex items-center justify-center h-full text-primary-500 text-sm"><LoadingSpinner message="Uploading..." /></div>
                        ) : fullMusicUrl ? (
                            <audio key={fullMusicUrl} src={fullMusicUrl} controls className="w-full" />
                        ) : (
                             <div className="flex items-center justify-center h-full text-primary-500 text-sm">No music set</div>
                        )}
                    </div>
                    <div className="space-y-4 w-full lg:w-1/2">
                        <div>
                            <label htmlFor="music-url" className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">URL Nhạc (mp3, wav, etc.)</label>
                            <input id="music-url" type="text" value={musicSetting.value} onChange={(e) => handleUrlChange(e, setMusicSetting)} placeholder="https://example.com/music.mp3" className="w-full p-2 bg-primary-100 dark:bg-primary-800/80 border border-primary-300 dark:border-primary-700 rounded-md shadow-sm focus:ring-secondary-500 focus:border-secondary-500" />
                        </div>
                        <div>
                            <label htmlFor="music-file" className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">Hoặc Tải lên Tệp Âm thanh</label>
                            <input id="music-file" type="file" ref={musicFileInputRef} onChange={(e) => handleFileChange(e, setMusicSetting, 'backgroundMusic', ['audio'])} accept="audio/*" className="w-full text-sm text-primary-600 dark:text-primary-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-secondary-100 dark:file:bg-secondary-800 file:text-secondary-700 dark:file:text-secondary-200 hover:file:bg-secondary-200 dark:hover:file:bg-secondary-700"/>
                        </div>
                    </div>
                </div>
            </div>

            {/* Auth Page Background */}
            <div className="p-4 rounded-lg border border-primary-200 dark:border-primary-700/50">
                <h2 className="text-xl font-semibold font-serif text-primary-800 dark:text-primary-200 mb-4">Nền Trang Xác thực</h2>
                <div className="flex flex-col lg:flex-row lg:items-start gap-8">
                     <div className="space-y-4 w-full lg:w-1/2">
                        <BackgroundPreview setting={authSetting} title="Nền Đăng nhập/Đăng ký" uploadingKey="authBackground" />
                    </div>
                    <div className="space-y-4 w-full lg:w-1/2">
                        <div>
                            <label htmlFor="auth-url" className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">URL Nền (Chỉ hình ảnh)</label>
                            <input id="auth-url" type="text" value={authSetting.value} onChange={(e) => handleUrlChange(e, setAuthSetting)} placeholder="https://example.com/image.jpg" className="w-full p-2 bg-primary-100 dark:bg-primary-800/80 border border-primary-300 dark:border-primary-700 rounded-md shadow-sm focus:ring-secondary-500 focus:border-secondary-500" />
                        </div>
                        <div>
                            <label htmlFor="auth-file" className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">Hoặc Tải lên Tệp</label>
                            <input id="auth-file" type="file" ref={authFileInputRef} onChange={(e) => handleFileChange(e, setAuthSetting, 'authBackground', ['image'])} accept="image/*" className="w-full text-sm text-primary-600 dark:text-primary-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-secondary-100 dark:file:bg-secondary-800 file:text-secondary-700 dark:file:text-secondary-200 hover:file:bg-secondary-200 dark:hover:file:bg-secondary-700"/>
                        </div>
                    </div>
                </div>
            </div>

            {/* Site Backgrounds */}
            <div className="p-4 rounded-lg border border-primary-200 dark:border-primary-700/50">
                <h2 className="text-xl font-semibold font-serif text-primary-800 dark:text-primary-200 mb-4">Nền Trang web Chính</h2>
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Light Mode Settings */}
                    <div className="space-y-4 w-full lg:w-1/2">
                        <BackgroundPreview setting={lightSetting} title="Chế độ Sáng" uploadingKey="backgroundLight" />
                        <div>
                            <label htmlFor="light-url" className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">URL Nền (Sáng)</label>
                            <input id="light-url" type="text" value={lightSetting.value} onChange={(e) => handleUrlChange(e, setLightSetting)} placeholder="https://example.com/image.jpg" className="w-full p-2 bg-primary-100 dark:bg-primary-800/80 border border-primary-300 dark:border-primary-700 rounded-md shadow-sm focus:ring-secondary-500 focus:border-secondary-500" />
                        </div>
                        <div>
                            <label htmlFor="light-file" className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">Hoặc Tải lên Tệp</label>
                            <input id="light-file" type="file" ref={lightFileInputRef} onChange={(e) => handleFileChange(e, setLightSetting, 'backgroundLight', ['image', 'video'])} accept="image/*,video/*" className="w-full text-sm text-primary-600 dark:text-primary-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-secondary-100 dark:file:bg-secondary-800 file:text-secondary-700 dark:file:text-secondary-200 hover:file:bg-secondary-200 dark:hover:file:bg-secondary-700"/>
                        </div>
                    </div>

                    {/* Dark Mode Settings */}
                    <div className="space-y-4 w-full lg:w-1/2">
                        <BackgroundPreview setting={darkSetting} title="Chế độ Tối" uploadingKey="backgroundDark" />
                        <div>
                            <label htmlFor="dark-url" className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">URL Nền (Tối)</label>
                            <input id="dark-url" type="text" value={darkSetting.value} onChange={(e) => handleUrlChange(e, setDarkSetting)} placeholder="https://example.com/video.mp4" className="w-full p-2 bg-primary-100 dark:bg-primary-800/80 border border-primary-300 dark:border-primary-700 rounded-md shadow-sm focus:ring-secondary-500 focus:border-secondary-500" />
                        </div>
                        <div>
                            <label htmlFor="dark-file" className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">Hoặc Tải lên Tệp</label>
                            <input id="dark-file" type="file" ref={darkFileInputRef} onChange={(e) => handleFileChange(e, setDarkSetting, 'backgroundDark', ['image', 'video'])} accept="image/*,video/*" className="w-full text-sm text-primary-600 dark:text-primary-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-secondary-100 dark:file:bg-secondary-800 file:text-secondary-700 dark:file:text-secondary-200 hover:file:bg-secondary-200 dark:hover:file:bg-secondary-700"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>


        <div className="mt-8 pt-6 border-t border-primary-200 dark:border-primary-700 flex justify-end gap-3">
            <button
                onClick={onShowBackgroundPreview}
                className="px-6 py-2.5 bg-primary-200 dark:bg-primary-700 hover:bg-primary-300 dark:hover:bg-primary-600 text-primary-800 dark:text-primary-100 font-bold rounded-lg transition-colors"
            >
                Xem trước Giao diện
            </button>
            <button
                onClick={handleSaveSettings}
                disabled={isSaving || !!uploading}
                className="px-6 py-2.5 bg-secondary-500 hover:bg-secondary-600 text-white font-bold rounded-lg transition-colors duration-300 shadow-lg shadow-secondary-500/20 hover:shadow-secondary-500/40 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-primary-900 disabled:opacity-50 disabled:cursor-wait flex items-center justify-center min-w-[120px]"
            >
                {isSaving ? <LoadingSpinner size="sm"/> : 'Lưu thay đổi'}
            </button>
        </div>
    </div>
  );
};

export default SiteSettingsView;
