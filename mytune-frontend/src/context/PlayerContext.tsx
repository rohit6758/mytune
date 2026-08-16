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
  repeatMode: 'off' | 'all' | 'one';
  isShuffle: boolean;
  playTrack: (track: Track) => void;
  playQueue: (tracks: Track[], startIndex?: number) => void;
  addToQueue: (track: Track) => void;
  insertNext: (tracks: Track[]) => void;
  pause: () => void;
  resume: () => void;
  next: (forceSkip?: boolean) => void;
  prev: () => void;
  seek: (time: number) => void;
  toggleRepeatMode: () => void;
  toggleShuffle: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [originalQueue, setOriginalQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [isShuffle, setIsShuffle] = useState(false);
  
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
    const handleEnded = () => next(false);
    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [queue, queueIndex, repeatMode, isShuffle]);

  // Update MediaSession API when track changes
  useEffect(() => {
    if (currentTrack && 'mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        artwork: [
          { src: currentTrack.cover_url, sizes: '512x512' },
          { src: currentTrack.cover_url, sizes: '192x192' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', resume);
      navigator.mediaSession.setActionHandler('pause', pause);
      navigator.mediaSession.setActionHandler('previoustrack', prev);
      navigator.mediaSession.setActionHandler('nexttrack', () => next(true));
    }
  }, [currentTrack, queue, queueIndex, repeatMode, isShuffle]);

  const playTrack = (track: Track) => {
    setOriginalQueue([track]);
    setQueue([track]);
    setQueueIndex(0);
    setCurrentTrack(track);
    loadAndPlay(track);
  };

  const playQueue = (tracks: Track[], startIndex = 0) => {
    if (tracks.length === 0) return;
    setOriginalQueue(tracks);
    
    if (isShuffle) {
      const current = tracks[startIndex];
      const remaining = tracks.filter((_, i) => i !== startIndex);
      const shuffled = remaining.sort(() => Math.random() - 0.5);
      const newQueue = [current, ...shuffled];
      setQueue(newQueue);
      setQueueIndex(0);
      setCurrentTrack(current);
      loadAndPlay(current);
    } else {
      setQueue(tracks);
      setQueueIndex(startIndex);
      setCurrentTrack(tracks[startIndex]);
      loadAndPlay(tracks[startIndex]);
    }
  };

  const addToQueue = (track: Track) => {
    setOriginalQueue(prev => [...prev, track]);
    setQueue(prev => [...prev, track]);
    if (!currentTrack) {
      playTrack(track);
    }
  };

  const insertNext = (tracks: Track[]) => {
    if (tracks.length === 0) return;
    setOriginalQueue(prev => {
      const copy = [...prev];
      copy.splice(queueIndex + 1, 0, ...tracks);
      return copy;
    });
    setQueue(prev => {
      const copy = [...prev];
      copy.splice(queueIndex + 1, 0, ...tracks);
      return copy;
    });
  };

  const toggleRepeatMode = () => {
    setRepeatMode(prev => prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off');
  };

  const toggleShuffle = () => {
    setIsShuffle(prev => {
      const nextShuffle = !prev;
      if (nextShuffle) {
        // Shuffle queue
        const remaining = originalQueue.filter(t => t.id !== currentTrack?.id);
        const shuffled = remaining.sort(() => Math.random() - 0.5);
        if (currentTrack) {
          setQueue([currentTrack, ...shuffled]);
          setQueueIndex(0);
        }
      } else {
        // Restore original queue
        setQueue(originalQueue);
        const index = originalQueue.findIndex(t => t.id === currentTrack?.id);
        setQueueIndex(Math.max(0, index));
      }
      return nextShuffle;
    });
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

  const next = (forceSkip = true) => {
    // If not forced (meaning it ended naturally) and repeat is 'one'
    if (!forceSkip && repeatMode === 'one') {
      seek(0);
      resume();
      return;
    }

    if (queueIndex < queue.length - 1) {
      const nextIndex = queueIndex + 1;
      setQueueIndex(nextIndex);
      setCurrentTrack(queue[nextIndex]);
      loadAndPlay(queue[nextIndex]);
    } else if (repeatMode === 'all') {
      // Loop back to start
      setQueueIndex(0);
      setCurrentTrack(queue[0]);
      loadAndPlay(queue[0]);
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
    } else if (repeatMode === 'all') {
      // Go to last track if loop all is on
      const lastIndex = queue.length - 1;
      setQueueIndex(lastIndex);
      setCurrentTrack(queue[lastIndex]);
      loadAndPlay(queue[lastIndex]);
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
      currentTrack, queue, isPlaying, progress, duration, repeatMode, isShuffle,
      playTrack, playQueue, addToQueue, insertNext, pause, resume, next, prev, seek, toggleRepeatMode, toggleShuffle
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
