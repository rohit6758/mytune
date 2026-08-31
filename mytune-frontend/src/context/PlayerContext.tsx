import React, { createContext, useContext, useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { getCachedAudioUrl } from '../lib/offlineCache';
import { fetchLyrics } from '../lib/lyricsService';

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
  lyrics: string | null;
  lyricsLoading: boolean;
  playTrack: (track: Track) => void;
  playQueue: (tracks: Track[], startIndex?: number) => void;
  loadQueue: (tracks: Track[], startIndex?: number) => void;
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
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  // AudioContext + GainNode for click-free crossfade without muting the element
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const sourceConnectedRef = useRef(false);
  // Guard against overlapping play() calls
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const pendingTrackRef = useRef<string | null>(null);

  // ── Set up the single <audio> element ───────────────────────────
  useEffect(() => {
    const audio = new Audio();
    audio.setAttribute('playsinline', '');
    audio.preload = 'metadata';
    audioRef.current = audio;

    // ── Screen Wake Lock: prevents OS from suspending audio when screen locks ──
    let wakeLock: WakeLockSentinel | null = null;
    const acquireWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch {}
    };
    acquireWakeLock();

    // Re-acquire wake lock when page becomes visible again
    const reacquire = () => { if (document.visibilityState === 'visible') acquireWakeLock(); };
    document.addEventListener('visibilitychange', reacquire);

    // ── Web Audio silent oscillator: keeps audio context alive in background ──
    // A gain of 0.00001 is completely inaudible but counts as "active audio"
    let audioCtx: AudioContext | null = null;
    let silentOscillator: OscillatorNode | null = null;

    const startSilentAudio = () => {
      try {
        if (audioCtx) return; // already running
        audioCtx = new AudioContext();
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 0.00001; // completely inaudible
        silentOscillator = audioCtx.createOscillator();
        silentOscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        silentOscillator.start();
      } catch {}
    };

    // Start on first user interaction (required by browsers)
    const onInteraction = () => {
      startSilentAudio();
      document.removeEventListener('touchstart', onInteraction);
      document.removeEventListener('click', onInteraction);
    };
    document.addEventListener('touchstart', onInteraction, { passive: true });
    document.addEventListener('click', onInteraction);

    // Re-resume AudioContext when page comes back (iOS kills it on background)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && audioCtx?.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      wakeLock?.release().catch(() => {});
      document.removeEventListener('visibilitychange', reacquire);
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('touchstart', onInteraction);
      document.removeEventListener('click', onInteraction);
      silentOscillator?.stop();
      audioCtx?.close().catch(() => {});
      audio.pause();
    };
  }, []);

  // ── Audio event listeners ────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay     = () => setIsPlaying(true);
    const handlePause    = () => setIsPlaying(false);
    const handleTimeUpdate = () => setProgress(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded    = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else {
        nextRef.current();
      }
    };

    audio.addEventListener('play',            handlePlay);
    audio.addEventListener('pause',           handlePause);
    audio.addEventListener('timeupdate',      handleTimeUpdate);
    audio.addEventListener('loadedmetadata',  handleLoadedMetadata);
    audio.addEventListener('ended',           handleEnded);

    return () => {
      audio.removeEventListener('play',           handlePlay);
      audio.removeEventListener('pause',          handlePause);
      audio.removeEventListener('timeupdate',     handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended',          handleEnded);
    };
  }, [repeatMode]);

  // ── Auto-fetch lyrics when track changes ─────────────────────────
  useEffect(() => {
    if (!currentTrack) { setLyrics(null); return; }
    setLyrics(null);
    setLyricsLoading(true);
    fetchLyrics(currentTrack.artist, currentTrack.title)
      .then(text => { setLyrics(text); })
      .finally(() => setLyricsLoading(false));
  }, [currentTrack?.id]);

  // ── MediaSession (lock screen controls) ─────────────────────────
  const actionRefs = useRef({ pause: () => {}, resume: () => {}, prev: () => {}, next: (f?: boolean) => {} });

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
    navigator.mediaSession.setActionHandler('play',          () => actionRefs.current.resume());
    navigator.mediaSession.setActionHandler('pause',         () => actionRefs.current.pause());
    navigator.mediaSession.setActionHandler('previoustrack', () => actionRefs.current.prev());
    navigator.mediaSession.setActionHandler('nexttrack',     () => actionRefs.current.next(true));
    navigator.mediaSession.setActionHandler('seekto',        (d) => { if (d.seekTime != null) seek(d.seekTime); });
  }, [currentTrack]);

  // ── Core playback: glitch-free track switch ──────────────────────
  const loadAndPlay = useCallback(async (track: Track) => {
    const audio = audioRef.current;
    if (!audio) return;

    pendingTrackRef.current = track.id;

    // Cancel any in-flight play promise safely
    if (playPromiseRef.current) {
      try { await playPromiseRef.current; } catch {}
    }

    // If a newer track was requested while we awaited, bail out
    if (pendingTrackRef.current !== track.id) return;

    // Fetch offline/cached URL
    const offlineUrl = await getCachedAudioUrl(track.id, track.preview_url);
    if (pendingTrackRef.current !== track.id) return;

    // Zero volume BEFORE src swap — eliminates the click/tick
    audio.volume = 0;
    audio.src = offlineUrl;

    // Try to play; restore volume once the play promise resolves
    const p = audio.play();
    playPromiseRef.current = p;
    try {
      await p;
      // Small ramp-up: set volume back over a few frames (~50ms) to mask pop
      const ramp = () => {
        if (!audioRef.current) return;
        if (audioRef.current.volume < 0.95) {
          audioRef.current.volume = Math.min(1, audioRef.current.volume + 0.12);
          requestAnimationFrame(ramp);
        } else {
          audioRef.current.volume = 1;
        }
      };
      ramp();
    } catch (err: any) {
      if (err?.name !== 'AbortError') console.error('Playback error', err);
      if (audioRef.current) audioRef.current.volume = 1;
    }
  }, []);

  const loadOnly = useCallback(async (track: Track) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    const offlineUrl = await getCachedAudioUrl(track.id, track.preview_url);
    audio.src = offlineUrl;
    audio.volume = 1;
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const resume = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    try {
      await audio.play();
      audio.volume = 1;
    } catch (err: any) {
      if (err?.name !== 'AbortError') console.error(err);
      if (audioRef.current) audioRef.current.volume = 1;
    }
  }, [currentTrack]);

  const toggle = useCallback(() => {
    if (audioRef.current?.paused) { resume(); } else { pause(); }
  }, [pause, resume]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  }, []);

  // ── Queue management ─────────────────────────────────────────────
  const loadQueue = useCallback((tracks: Track[], startIndex = 0) => {
    if (!tracks.length) return;
    setOriginalQueue(tracks);
    setQueue(tracks);
    setQueueIndex(startIndex);
    setCurrentTrack(tracks[startIndex]);
    loadOnly(tracks[startIndex]);
  }, [loadOnly]);

  const playQueue = useCallback((tracks: Track[], startIndex = 0) => {
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
  }, [isShuffle, loadAndPlay]);

  const playTrack = useCallback((track: Track) => {
    setOriginalQueue([track]);
    setQueue([track]);
    setQueueIndex(0);
    setCurrentTrack(track);
    loadAndPlay(track);
  }, [loadAndPlay]);

  const addToQueue = useCallback((track: Track) => {
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
  }, [currentTrack, loadOnly]);

  const insertNext = useCallback((tracks: Track[]) => {
    if (!tracks.length) return;
    setOriginalQueue(prev => { const c = [...prev]; c.splice(queueIndex + 1, 0, ...tracks); return c; });
    setQueue(prev => { const c = [...prev]; c.splice(queueIndex + 1, 0, ...tracks); return c; });
  }, [queueIndex]);

  // Use a ref so the `ended` handler always has latest state
  const nextRef = useRef<() => void>(() => {});

  const next = useCallback((forceSkip = true) => {
    // Access queue from ref below
    setQueue(currentQueue => {
      setQueueIndex(currentIdx => {
        const ni = currentIdx < currentQueue.length - 1 ? currentIdx + 1 : 0;
        const track = currentQueue[ni];
        setCurrentTrack(track);
        loadAndPlay(track);
        return ni;
      });
      return currentQueue;
    });
  }, [loadAndPlay]);

  useEffect(() => { nextRef.current = next; }, [next]);

  const prev = useCallback(() => {
    if (progress > 3) {
      seek(0);
    } else {
      setQueue(currentQueue => {
        setQueueIndex(currentIdx => {
          const pi = currentIdx > 0 ? currentIdx - 1 : currentQueue.length - 1;
          const track = currentQueue[pi];
          setCurrentTrack(track);
          loadAndPlay(track);
          return pi;
        });
        return currentQueue;
      });
    }
  }, [progress, seek, loadAndPlay]);

  const toggleRepeatMode = useCallback(() => {
    setRepeatMode(prev => prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off');
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => {
      const next = !prev;
      if (next) {
        setQueue(q => {
          const remaining = q.filter(t => t.id !== currentTrack?.id).sort(() => Math.random() - 0.5);
          return currentTrack ? [currentTrack, ...remaining] : q;
        });
        setQueueIndex(0);
      } else {
        setQueue(originalQueue);
        setQueueIndex(Math.max(0, originalQueue.findIndex(t => t.id === currentTrack?.id)));
      }
      return next;
    });
  }, [currentTrack, originalQueue]);

  // Sync action refs
  useEffect(() => {
    actionRefs.current = { pause, resume, prev, next };
  });

  return (
    <PlayerContext.Provider value={{
      currentTrack, queue, isPlaying, progress, duration, repeatMode, isShuffle,
      lyrics, lyricsLoading,
      playTrack, playQueue, loadQueue, addToQueue, insertNext,
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
