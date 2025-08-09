import React, { useRef, useEffect } from 'react';

interface BackgroundMusicPlayerProps {
  musicUrl: string | null;
  isPlaying: boolean;
}

const BackgroundMusicPlayer: React.FC<BackgroundMusicPlayerProps> = ({ musicUrl, isPlaying }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying && musicUrl) {
      if (audio.src !== musicUrl) {
        audio.src = musicUrl;
      }
      // play() returns a promise which can be rejected if the user hasn't interacted with the page yet.
      audio.play().catch(error => {
        // This error is common on first load in modern browsers. 
        // We can safely ignore it as the music will play once the user interacts.
        console.log("Audio play prevented by browser policy. It will start after user interaction.");
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, musicUrl]);

  if (!musicUrl) return null;

  return (
    <audio ref={audioRef} loop aria-hidden="true" />
  );
};

export default BackgroundMusicPlayer;
