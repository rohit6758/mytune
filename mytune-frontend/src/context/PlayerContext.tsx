import React, { createContext, useContext, useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { getCachedAudioUrl } from '../lib/offlineCache';

export interface Track {
  id: string;
  title: string;
  artist: string;
  cover_url: string;
  preview_url: string;
  lyrics?: string;
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
  loadQueue: (tracks: Track[], startIndex?: number) => void; // Load without auto-playing
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
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('all'); // Default to loop all
  const [isShuffle, setIsShuffle] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Bind audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setProgress(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else {
        next();
      }
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [repeatMode, queueIndex, queue.length]);

  // Refs for stable MediaSession callbacks
  const actionRefs = useRef({ pause: () => {}, resume: () => {}, prev: () => {}, next: (f?: boolean) => {} });

  // MediaSession API — keeps controls on lock screen & notification shade
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
    navigator.mediaSession.setActionHandler('play', () => actionRefs.current.resume());
    navigator.mediaSession.setActionHandler('pause', () => actionRefs.current.pause());
    navigator.mediaSession.setActionHandler('previoustrack', () => actionRefs.current.prev());
    navigator.mediaSession.setActionHandler('nexttrack', () => actionRefs.current.next(true));
  }, [currentTrack]);

  const loadAndPlay = async (track: Track) => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    
    // Mute immediately to mask the source-swap 'tick'
    audio.volume = 0;
    
    // Fetch offline URL from IndexedDB cache
    const offlineUrl = await getCachedAudioUrl(track.id, track.preview_url);
    
    // DIRECTLY assign src. NO pause(), NO removeAttribute, NO load().
    // This is the ONLY way to keep the mobile OS from killing the background MediaSession!
    audio.src = offlineUrl;
    
    try {
      await audio.play();
      // Instantly restore volume once the play promise resolves
      audio.volume = 1;
    } catch (err: any) {
      if (err.name !== 'AbortError') console.error('Playback failed', err);
      audio.volume = 1; // Always restore volume on error so it isn't stuck muted
    }
  };

  const loadOnly = async (track: Track) => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    audio.pause();
    
    // Fetch offline URL from IndexedDB cache
    const offlineUrl = await getCachedAudioUrl(track.id, track.preview_url);
    audio.src = offlineUrl;
    audio.volume = 1;
  };

  const pause = () => { 
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };
  
  const resume = async () => { 
    if (audioRef.current && currentTrack) {
      try {
        await audioRef.current.play();
        audioRef.current.volume = 1;
      } catch (err: any) {
        if (err.name !== 'AbortError') console.error(err);
        if (audioRef.current) audioRef.current.volume = 1;
      }
    }
  };
  const toggle = () => { isPlaying ? pause() : resume(); };

  // Load without auto-play — used when the feed loads tracks
  const loadQueue = (tracks: Track[], startIndex = 0) => {
    if (!tracks.length) return;
    setOriginalQueue(tracks);
    setQueue(tracks);
    setQueueIndex(startIndex);
    setCurrentTrack(tracks[startIndex]);
    loadOnly(tracks[startIndex]); // no auto-play
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
      setCurrentTrack(current);
      loadAndPlay(current);
    } else {
      setQueue(tracks);
      setQueueIndex(startIndex);
      setCurrentTrack(tracks[startIndex]);
      loadAndPlay(tracks[startIndex]);
    }
  };

  const playTrack = (track: Track) => {
    setOriginalQueue([track]);
    setQueue([track]);
    setQueueIndex(0);
    setCurrentTrack(track);
    loadAndPlay(track);
  };

  const addToQueue = (track: Track) => {
    setOriginalQueue(prev => [...prev, track]);
    setQueue(prev => {
      const next = [...prev, track];
      if (!currentTrack) {
        setQueueIndex(0);
        setCurrentTrack(track);
        loadOnly(track);
      }
      return next;
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
      setCurrentTrack(queue[ni]);
      loadAndPlay(queue[ni]);
    } else {
      // Always loop back — treat as 'all' repeat for infinite listen
      setQueueIndex(0);
      setCurrentTrack(queue[0]);
      loadAndPlay(queue[0]);
    }
  };

  const prev = () => {
    if (progress > 3) {
      seek(0);
    } else if (queueIndex > 0) {
      const pi = queueIndex - 1;
      setQueueIndex(pi);
      setCurrentTrack(queue[pi]);
      loadAndPlay(queue[pi]);
    } else {
      const last = queue.length - 1;
      setQueueIndex(last);
      setCurrentTrack(queue[last]);
      loadAndPlay(queue[last]);
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const toggleRepeatMode = () => {
    setRepeatMode(prev => prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off');
  };

  // Sync actionRefs on every render
  useEffect(() => {
    actionRefs.current = { pause, resume, prev, next };
  });

  const toggleShuffle = () => {
    setIsShuffle(prev => {
      const next = !prev;
      if (next) {
        const remaining = originalQueue.filter(t => t.id !== currentTrack?.id).sort(() => Math.random() - 0.5);
        if (currentTrack) {
          setQueue([currentTrack, ...remaining]);
          setQueueIndex(0);
        }
      } else {
        setQueue(originalQueue);
        setQueueIndex(Math.max(0, originalQueue.findIndex(t => t.id === currentTrack?.id)));
      }
      return next;
    });
  };

  return (
    <PlayerContext.Provider value={{
      currentTrack, queue, isPlaying, progress, duration, repeatMode, isShuffle,
      playTrack, playQueue, loadQueue, addToQueue, insertNext,
      pause, resume, toggle, next, prev, seek, toggleRepeatMode, toggleShuffle,
    }}>
      <audio ref={audioRef} playsInline preload="metadata" />
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within a PlayerProvider');
  return ctx;
}
