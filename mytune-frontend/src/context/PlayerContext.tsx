import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';

export interface Track {
  id: string;
  title: string;
  artist: string;
  cover_url: string;
  preview_url: string;
}

interface PlayerContextType {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  progress: number;
  duration: number;
  playTrack: (track: Track) => void;
  playQueue: (tracks: Track[], startIndex?: number) => void;
  addToQueue: (track: Track) => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setProgress(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      // Need a ref for queue/queueIndex since closure captures stale state
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  // Use a separate effect to bind ended so it always has fresh state
  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    const handleEnded = () => next();
    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [queue, queueIndex]);

  // Update MediaSession API when track changes
  useEffect(() => {
    if (currentTrack && 'mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        artwork: [
          { src: currentTrack.cover_url, sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', resume);
      navigator.mediaSession.setActionHandler('pause', pause);
      navigator.mediaSession.setActionHandler('previoustrack', prev);
      navigator.mediaSession.setActionHandler('nexttrack', next);
    }
  }, [currentTrack, queue, queueIndex]); // Dependencies include queue for next/prev

  const playTrack = (track: Track) => {
    setQueue([track]);
    setQueueIndex(0);
    setCurrentTrack(track);
    loadAndPlay(track);
  };

  const playQueue = (tracks: Track[], startIndex = 0) => {
    if (tracks.length === 0) return;
    setQueue(tracks);
    setQueueIndex(startIndex);
    setCurrentTrack(tracks[startIndex]);
    loadAndPlay(tracks[startIndex]);
  };

  const addToQueue = (track: Track) => {
    setQueue(prev => [...prev, track]);
    if (!currentTrack) {
      playTrack(track);
    }
  };

  const loadAndPlay = (track: Track) => {
    if (audioRef.current) {
      audioRef.current.src = track.preview_url;
      audioRef.current.play().catch(console.error);
    }
  };

  const pause = () => {
    if (audioRef.current) audioRef.current.pause();
  };

  const resume = () => {
    if (audioRef.current && currentTrack) audioRef.current.play().catch(console.error);
  };

  const next = () => {
    if (queueIndex < queue.length - 1) {
      const nextIndex = queueIndex + 1;
      setQueueIndex(nextIndex);
      setCurrentTrack(queue[nextIndex]);
      loadAndPlay(queue[nextIndex]);
    } else {
      // Reached end of queue
      pause();
      setProgress(0);
      if (audioRef.current) audioRef.current.currentTime = 0;
    }
  };

  const prev = () => {
    if (progress > 3) {
      // Restart current track
      seek(0);
    } else if (queueIndex > 0) {
      const prevIndex = queueIndex - 1;
      setQueueIndex(prevIndex);
      setCurrentTrack(queue[prevIndex]);
      loadAndPlay(queue[prevIndex]);
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  return (
    <PlayerContext.Provider value={{
      currentTrack, queue, isPlaying, progress, duration,
      playTrack, playQueue, addToQueue, pause, resume, next, prev, seek
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
