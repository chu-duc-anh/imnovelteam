

import React, { useState, useEffect } from 'react';
import { SiteSetting } from '../types';
import { toAbsoluteUrl } from '../utils';

interface DynamicBackgroundProps {
  settings: SiteSetting[];
  theme: 'light' | 'dark';
}

const DEFAULT_BG_LIGHT = 'https://images.unsplash.com/photo-1500964757637-c85e8a162699?q=80&w=3003&auto=format&fit=crop';
const DEFAULT_BG_DARK = 'https://images.unsplash.com/photo-1532188438641-863a1171a74d?q=80&w=2938&auto=format&fit=crop';

const BackgroundLayer: React.FC<{ url: string; mediaType: 'image' | 'video'; active: boolean; }> = React.memo(({ url, mediaType, active }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const commonClasses = "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out";

  const handleLoad = () => setIsLoaded(true);

  // Reset loaded state if the url changes, to allow the fade-in effect on new backgrounds
  useEffect(() => {
    setIsLoaded(false);
  }, [url]);

  return (
    <>
      {mediaType === 'image' ? (
        <img
          src={url}
          onLoad={handleLoad}
          className={`${commonClasses} ${active && isLoaded ? 'opacity-100' : 'opacity-0'}`}
          alt=""
          aria-hidden="true"
        />
      ) : (
        <video
          key={url} // Use key to force re-render when src changes
          src={url}
          onCanPlay={handleLoad}
          autoPlay
          loop
          muted
          playsInline
          className={`${commonClasses} ${active && isLoaded ? 'opacity-100' : 'opacity-0'}`}
          aria-hidden="true"
        />
      )}
    </>
  );
});

const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ settings, theme }) => {
  const bgLightSetting = settings.find(s => s.key === 'backgroundLight');
  const bgDarkSetting = settings.find(s => s.key === 'backgroundDark');

  const lightUrl = toAbsoluteUrl(bgLightSetting?.value) || DEFAULT_BG_LIGHT;
  let lightType: 'image' | 'video' = 'image';
  if (bgLightSetting && (bgLightSetting.mediaType === 'image' || bgLightSetting.mediaType === 'video')) {
    lightType = bgLightSetting.mediaType;
  }

  const darkUrl = toAbsoluteUrl(bgDarkSetting?.value) || DEFAULT_BG_DARK;
  let darkType: 'image' | 'video' = 'image';
  if (bgDarkSetting && (bgDarkSetting.mediaType === 'image' || bgDarkSetting.mediaType === 'video')) {
    darkType = bgDarkSetting.mediaType;
  }

  return (
    <div className="fixed inset-0 w-screen h-screen -z-10 overflow-hidden bg-black" aria-hidden="true">
        <BackgroundLayer url={lightUrl} mediaType={lightType} active={theme === 'light'} />
        <BackgroundLayer url={darkUrl} mediaType={darkType} active={theme === 'dark'} />
    </div>
  );
};

export default DynamicBackground;