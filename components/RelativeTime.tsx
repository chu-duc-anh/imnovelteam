import React, { useState, useEffect } from 'react';
import { formatRelativeTime } from '../utils';

interface RelativeTimeProps {
  timestamp?: number;
  className?: string;
}

const RelativeTime: React.FC<RelativeTimeProps> = ({ timestamp, className }) => {
  const [displayText, setDisplayText] = useState(() => formatRelativeTime(timestamp));

  useEffect(() => {
    if (timestamp === undefined || timestamp === null) return;

    // Update time every 30 seconds for recent items, less frequently for older ones.
    const now = Date.now();
    const ageInSeconds = (now - timestamp) / 1000;
    
    // More frequent updates for recent chapters
    const updateFrequency = ageInSeconds < 3600 ? 30000 : 60000; // 30s if <1hr old, else 1min

    const intervalId = setInterval(() => {
      setDisplayText(formatRelativeTime(timestamp));
    }, updateFrequency);

    // Also update immediately if the timestamp changes
    setDisplayText(formatRelativeTime(timestamp));

    // Clear interval on cleanup
    return () => clearInterval(intervalId);
  }, [timestamp]);

  if (timestamp === undefined || timestamp === null) {
    return null;
  }

  return <span className={className}>{displayText}</span>;
};

export default RelativeTime;
