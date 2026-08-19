// @ts-nocheck
import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';

export interface Track {
  id: string;
  title: string;
  artist: string;
  cover_url: string;
  preview_url?: string;
  duration?: number;
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
  loadQueue: (tracks: Track[], startIndex?: number) => void; 
  loadOnly: (track: Track) => void;
  addToQueue: (track: Track) => void;
  insertNext: (tracks: Track[]) => void;
  pause: () => void;
  resume: () => void;
  toggle: () => void;
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
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('all'); 
  const [isShuffle, setIsShuffle] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
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

  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    const handleEnded = () => next(false);
    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [queue, queueIndex, repeatMode, isShuffle]);

  useEffect(() => {
    if (!currentTrack || !('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist,
      artwork: [
        { src: currentTrack.cover_url, sizes: '512x512', type: 'image/jpeg' },
        { src: currentTrack.cover_url, sizes: '192x192', type: 'image/jpeg' },
      ],
    });
    navigator.mediaSession.setActionHandler('play', () => resume());
    navigator.mediaSession.setActionHandler('pause', () => pause());
    navigator.mediaSession.setActionHandler('previoustrack', () => prev());
    navigator.mediaSession.setActionHandler('nexttrack', () => next(true));
  }, [currentTrack]);

  const loadAndPlay = (track: Track) => {
    if (!audioRef.current) return;
    if (audioRef.current.src === track.preview_url || audioRef.current.src.endsWith(track.preview_url)) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
      return;
    }
    setCurrentTrack(track);
    audioRef.current.src = track.preview_url || '';
    audioRef.current.play().catch(console.error);
    setIsPlaying(true);
  };

  const loadOnly = (track: Track) => {
    if (!audioRef.current) return;
    setCurrentTrack(track);
    audioRef.current.src = track.preview_url || '';
    audioRef.current.load();
    setIsPlaying(false);
  };

  const pause = () => { audioRef.current?.pause(); };
  const resume = () => { if (audioRef.current && currentTrack) audioRef.current.play().catch(console.error); };
  const toggle = () => { isPlaying ? pause() : resume(); };

  const loadQueue = (tracks: Track[], startIndex = 0) => {
    if (!tracks.length) return;
    setOriginalQueue(tracks);
    setQueue(tracks);
    setQueueIndex(startIndex);
    loadOnly(tracks[startIndex]);
  };

  const playQueue = (tracks: Track[], startIndex = 0) => {
    if (!tracks.length) return;
    setOriginalQueue(tracks);
    if (isShuffle) {
      const current = tracks[startIndex];
      const remaining = tracks.filter((_, i) => i !== startIndex).sort(() => Math.random() - 0.5);
      const newQueue = [current, ...remaining];
      setQueue(newQueue);
      setQueueIndex(0);
      loadAndPlay(current);
    } else {
      setQueue(tracks);
      setQueueIndex(startIndex);
      loadAndPlay(tracks[startIndex]);
    }
  };

  const playTrack = (track: Track) => {
    setOriginalQueue([track]);
    setQueue([track]);
    setQueueIndex(0);
    loadAndPlay(track);
  };

  const addToQueue = (track: Track) => {
    setOriginalQueue(prev => [...prev, track]);
    setQueue(prev => {
      const nextQ = [...prev, track];
      if (!currentTrack) {
        setQueueIndex(0);
        loadOnly(track);
      }
      return nextQ;
    });
  };

  const insertNext = (tracks: Track[]) => {
    if (!tracks.length) return;
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

  const next = (forceSkip = true) => {
    if (!forceSkip && repeatMode === 'one') {
      seek(0);
      resume();
      return;
    }
    if (queueIndex < queue.length - 1) {
      const ni = queueIndex + 1;
      setQueueIndex(ni);
      loadAndPlay(queue[ni]);
    } else {
      if (repeatMode === 'off' && !forceSkip) {
        pause();
      } else {
        setQueueIndex(0);
        loadAndPlay(queue[0]);
      }
    }
  };

  const prev = () => {
    if (progress > 3) {
      seek(0);
    } else if (queueIndex > 0) {
      const pi = queueIndex - 1;
      setQueueIndex(pi);
      loadAndPlay(queue[pi]);
    } else {
      const last = queue.length - 1;
      setQueueIndex(last);
      loadAndPlay(queue[last]);
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const toggleRepeatMode = () => setRepeatMode(prev => prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off');

  const toggleShuffle = () => {
    setIsShuffle(prev => {
      const nextVal = !prev;
      if (nextVal) {
        const remaining = originalQueue.filter(t => t.id !== currentTrack?.id).sort(() => Math.random() - 0.5);
        if (currentTrack) {
          setQueue([currentTrack, ...remaining]);
          setQueueIndex(0);
        }
      } else {
        setQueue(originalQueue);
        setQueueIndex(Math.max(0, originalQueue.findIndex(t => t.id === currentTrack?.id)));
      }
      return nextVal;
    });
  };

  return (
    <PlayerContext.Provider value={{
      currentTrack, queue, isPlaying, progress, duration, repeatMode, isShuffle,
      playTrack, playQueue, loadQueue, loadOnly, addToQueue, insertNext,
      pause, resume, toggle, next, prev, seek, toggleRepeatMode, toggleShuffle,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within a PlayerProvider');
  return ctx;
}
