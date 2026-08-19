import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { getAudioStreamUrl } from '../lib/ytmusic';

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

  const fetchFullYTAudio = async (track: Track): Promise<string | null> => {
    // If it's a YT ID (11 chars)
    if (track.id && track.id.length === 11 && !track.id.includes('-')) {
      return await getAudioStreamUrl(track.id);
    }
    // Otherwise it's an iTunes ID (numbers) or custom ID. Let's search YT for it!
    try {
      const results = await searchYTSongs(`${track.title} ${track.artist}`);
      if (results && results.length > 0) {
        return await getAudioStreamUrl(results[0].id);
      }
    } catch (e) {
      console.warn('Failed to find YT stream for iTunes track', e);
    }
    return null;
  };

  const loadAndPlay = async (track: Track) => {
    if (!audioRef.current) return;
    
    let url = track.preview_url;
    // Always try to fetch full stream from YT first
    const fullUrl = await fetchFullYTAudio(track);
    if (fullUrl) {
      url = fullUrl;
      track.preview_url = fullUrl; // Cache it
    }

    if (!url) {
      console.error("No audio URL found for track");
      return;
    }

    // Optimization: If it's the exact same track looping, just seek to 0
    if (audioRef.current.src === url || audioRef.current.src.endsWith(url)) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
      return;
    }

    audioRef.current.src = url;
    audioRef.current.play().catch(console.error);
  };

  const loadOnly = async (track: Track) => {
    if (!audioRef.current) return;
    
    let url = track.preview_url;
    // Do NOT aggressively search YT on preload, only if it's already a YT ID to save API calls
    if (track.id && track.id.length === 11 && !track.id.includes('-')) {
      const fullUrl = await fetchFullYTAudio(track);
      if (fullUrl) {
        url = fullUrl;
        track.preview_url = fullUrl;
      }
    }
    
    if (url && audioRef.current.src !== url) {
      audioRef.current.src = url;
      audioRef.current.load();
    }
  };

  const pause = () => { audioRef.current?.pause(); };
  const resume = () => { if (audioRef.current && currentTrack) audioRef.current.play().catch(console.error); };
  const toggle = () => { isPlaying ? pause() : resume(); };

  const loadQueue = (tracks: Track[], startIndex = 0) => {
    if (!tracks.length) return;
    setOriginalQueue(tracks);
    setQueue(tracks);
    setQueueIndex(startIndex);
    setCurrentTrack(tracks[startIndex]);
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
    // If not forced (i.e. track ended naturally) and repeat is ONE, loop it
    if (!forceSkip && repeatMode === 'one') {
      seek(0);
      resume();
      return;
    }
    
    // If we have more tracks in queue
    if (queueIndex < queue.length - 1) {
      const ni = queueIndex + 1;
      setQueueIndex(ni);
      setCurrentTrack(queue[ni]);
      loadAndPlay(queue[ni]);
    } else {
      // End of queue. If repeat is off, stop. If repeat is all, loop to 0.
      if (repeatMode === 'off' && !forceSkip) {
        pause();
      } else {
        setQueueIndex(0);
        setCurrentTrack(queue[0]);
        // If it's a 1-track queue, loadAndPlay handles optimization
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
