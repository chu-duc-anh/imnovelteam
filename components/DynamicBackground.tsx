import React, { useState, useEffect, useRef } from 'react';
import { SiteSetting } from '../types';
import { toAbsoluteUrl } from '../utils';

interface DynamicBackgroundProps {
  settings: SiteSetting[];
  theme: 'light' | 'dark';
}

const BackgroundLayer: React.FC<{ url: string; mediaType: 'image' | 'video'; active: boolean; }> = React.memo(({ url, mediaType, active }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const commonClasses = "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out";

  const handleLoad = () => setIsLoaded(true);

  // Reset loaded state if the url changes, to allow the fade-in effect on new backgrounds
  useEffect(() => {
    setIsLoaded(false);
  }, [url]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (active && videoElement) {
      videoElement.play().catch(error => {
        console.warn("Background video autoplay was prevented:", error);
      });
    }
  }, [active, url]);


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
          ref={videoRef}
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

  const lightUrl = toAbsoluteUrl(bgLightSetting?.value) || null;
  const lightType = bgLightSetting?.mediaType === 'video' ? 'video' : 'image';

  const darkUrl = toAbsoluteUrl(bgDarkSetting?.value) || null;
  const darkType = bgDarkSetting?.mediaType === 'video' ? 'video' : 'image';

  // Determine the solid color fallback which is always present
  const fallbackBgColor = theme === 'light' ? 'bg-white' : 'bg-black';

  return (
    <div className={`fixed inset-0 w-screen h-screen -z-10 overflow-hidden transition-colors duration-1000 ${fallbackBgColor}`} aria-hidden="true">
      {/* Only render layers if they have a URL */}
      {lightUrl && <BackgroundLayer url={lightUrl} mediaType={lightType} active={theme === 'light'} />}
      {darkUrl && <BackgroundLayer url={darkUrl} mediaType={darkType} active={theme === 'dark'} />}
    </div>
  );
};

export default DynamicBackground;
