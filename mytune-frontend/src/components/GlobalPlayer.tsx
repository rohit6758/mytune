import React, { useState, useEffect, useRef } from 'react';
import hotToast from 'react-hot-toast';
import { usePlayer } from '../context/PlayerContext';
import type { Track } from '../context/PlayerContext';
import { supabase } from '../lib/supabase';

declare global { interface Window { _mytuneAudio?: HTMLAudioElement; } }

export default function GlobalPlayer() {
  const { currentTrack, isPlaying, progress, duration, toggle, next, prev, seek, isShuffle, toggleShuffle, repeatMode, toggleRepeatMode, lyrics, lyricsLoading } = usePlayer();
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [pendingTrack, setPendingTrack] = useState<Track | null>(null);
  const [userPlaylists, setUserPlaylists] = useState<any[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const track = (e as CustomEvent<Track>).detail;
      setPendingTrack(track);
      loadPlaylists();
      setShowPlaylistMenu(true);
    };
    window.addEventListener('mytune:add-to-playlist', handler);
    return () => window.removeEventListener('mytune:add-to-playlist', handler);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const loadPlaylists = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('playlists').select('*').eq('user_id', user.id);
    if (data) setUserPlaylists(data);
  };

  const addToPlaylist = async (playlistId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const track = pendingTrack || currentTrack;
    if (!user || !track) return;
    try {
      await supabase.from('playlist_tracks').insert({
        playlist_id: playlistId, user_id: user.id, track_id: track.id,
        title: track.title, artist: track.artist, cover_url: track.cover_url, preview_url: track.preview_url,
      });
      showToast('Added to playlist ✓');
    } catch (err) { showToast('Failed to add'); }
    setShowPlaylistMenu(false);
    setPendingTrack(null);
  };

  const handleDownload = async (track: Track) => {
    try {
      const { getCachedAudioUrl } = await import('../lib/offlineCache');
      const offlineUrl = await getCachedAudioUrl({
        id: track.id,
        title: track.title,
        artist: track.artist,
        preview_url: track.preview_url,
      });
      const a = document.createElement('a');
      a.href = offlineUrl;
      a.download = `${track.title} - ${track.artist}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Downloading… ✓');
    } catch (e) {
      hotToast('Download failed');
    }
  };

  const openNowPlaying = () => {
    setClosing(false);
    setShowNowPlaying(true);
  };

  const closeNowPlaying = () => {
    setClosing(true);
    setTimeout(() => { setShowNowPlaying(false); setClosing(false); }, 280);
  };

  if (!currentTrack) return null;

  const pct = duration > 0 ? (progress / duration) * 100 : 0;
  const fmt = (t: number) => isNaN(t) ? '0:00' : `${Math.floor(t / 60)}:${Math.floor(t % 60).toString().padStart(2, '0')}`;

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[300] bg-[#D2EA7C] text-black font-bold text-sm px-5 py-2 rounded-full shadow-lg">
          {toast}
        </div>
      )}

      {/* Add to Playlist bottom sheet */}
      {showPlaylistMenu && (
        <div className="fixed inset-0 z-[250] flex items-end" onClick={() => { setShowPlaylistMenu(false); setPendingTrack(null); }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
          <div
            className="relative w-full rounded-t-3xl p-6 flex flex-col gap-4 z-10"
            style={{
              background: 'rgba(16, 14, 24, 0.92)',
              backdropFilter: 'blur(32px) saturate(180%)',
              WebkitBackdropFilter: 'blur(32px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderBottom: 'none',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto -mt-1 mb-1" />
            <h3 className="text-lg font-black text-white">Add to Playlist</h3>
            <p className="text-white/40 text-sm -mt-2 truncate">{(pendingTrack || currentTrack)?.title}</p>

            {userPlaylists.length === 0 ? (
              <p className="text-white/30 text-sm py-4 text-center">No playlists yet. Create one in the Library tab!</p>
            ) : (
              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto inner-scroll">
                {userPlaylists.map(pl => (
                  <button
                    key={pl.id}
                    onClick={() => addToPlaylist(pl.id)}
                    className="flex items-center gap-3 p-3 rounded-2xl glass-card text-left active:scale-95 transition-transform"
                  >
                    <span className="material-symbols-outlined text-[#D2EA7C] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>queue_music</span>
                    <span className="text-white font-semibold text-sm truncate">{pl.name}</span>
                  </button>
                ))}
              </div>
            )}

            <button onClick={() => { setShowPlaylistMenu(false); setPendingTrack(null); }}
              className="w-full py-3 rounded-full glass text-white/60 font-bold text-sm mt-1">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Full-Screen Now Playing Modal ───────────────────────── */}
      {showNowPlaying && (
        <div
          className={`fixed inset-0 z-[200] flex flex-col ${closing ? 'now-playing-exit' : 'now-playing-enter'}`}
          style={{
            background: '#0a0a0f',
          }}
        >
          {/* Ambient blurred album art background */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${currentTrack.cover_url})`,
              filter: 'blur(60px) brightness(0.18) saturate(2)',
              transform: 'scale(1.1)',
            }}
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80" />

          {/* Content */}
          <div className="relative z-10 flex flex-col h-full px-6 pt-safe-top pb-safe-bottom" style={{ paddingTop: 'max(env(safe-area-inset-top), 20px)', paddingBottom: 'max(env(safe-area-inset-bottom), 24px)' }}>

            {/* Top bar */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={closeNowPlaying} className="w-10 h-10 flex items-center justify-center rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <span className="material-symbols-outlined text-white text-xl">keyboard_arrow_down</span>
              </button>
              <div className="flex flex-col items-center">
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Now Playing</span>
              </div>
              <button
                onClick={() => { setPendingTrack(currentTrack); loadPlaylists(); setShowPlaylistMenu(true); }}
                className="w-10 h-10 flex items-center justify-center rounded-full"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              >
                <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 0" }}>playlist_add</span>
              </button>
            </div>

            {/* Album art */}
            <div className="flex justify-center mb-8">
              <div
                className="w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden shadow-2xl"
                style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)' }}
              >
                <img
                  src={currentTrack.cover_url}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Track info */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1 min-w-0">
                <h2 className="text-white text-2xl font-black leading-tight truncate">{currentTrack.title}</h2>
                <p className="text-white/50 text-base font-semibold truncate mt-0.5">{currentTrack.artist}</p>
              </div>
              <button
                onClick={() => handleDownload(currentTrack)}
                className="w-10 h-10 flex items-center justify-center rounded-full flex-shrink-0 ml-3"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              >
                <span className="material-symbols-outlined text-white/70 text-xl" style={{ fontVariationSettings: "'FILL' 0" }}>download</span>
              </button>
            </div>

            {/* Progress bar */}
            <div className="mb-1">
              <div className="w-full relative h-5 flex items-center group cursor-pointer">
                <div className="absolute left-0 right-0 h-1 bg-white/15 rounded-full pointer-events-none" />
                <div className="absolute left-0 h-1 rounded-full bg-[#D2EA7C] pointer-events-none" style={{ width: `${pct}%` }} />
                <div
                  className="absolute h-3.5 w-3.5 bg-white rounded-full pointer-events-none shadow-md"
                  style={{ left: `calc(${pct}% - 7px)` }}
                />
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={progress || 0}
                  onChange={(e) => seek(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer m-0 z-10 touch-none"
                />
              </div>
              <div className="flex justify-between text-white/40 text-xs font-semibold mt-1">
                <span>{fmt(progress)}</span>
                <span>{fmt(duration)}</span>
              </div>
            </div>

            {/* Main controls */}
            <div className="flex items-center justify-between mt-2 mb-6">
              <button onClick={toggleShuffle} className={`p-2 transition-colors ${isShuffle ? 'text-[#D2EA7C]' : 'text-white/40'}`}>
                <span className="material-symbols-outlined text-2xl">shuffle</span>
              </button>

              <button onClick={prev} className="p-2 text-white/80 active:text-white transition-colors">
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>skip_previous</span>
              </button>

              <button
                onClick={toggle}
                className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform"
                style={{ background: '#D2EA7C', boxShadow: '0 8px 32px rgba(210,234,124,0.4)' }}
              >
                <span className="material-symbols-outlined text-black text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>

              <button onClick={() => next(true)} className="p-2 text-white/80 active:text-white transition-colors">
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>skip_next</span>
              </button>

              <button onClick={toggleRepeatMode} className={`p-2 transition-colors ${repeatMode !== 'off' ? 'text-[#D2EA7C]' : 'text-white/40'}`}>
                <span className="material-symbols-outlined text-2xl">
                  {repeatMode === 'one' ? 'repeat_one' : 'repeat'}
                </span>
              </button>
            </div>

            {/* Lyrics / Caption section */}
            <div
              className="flex-1 rounded-2xl overflow-hidden flex flex-col"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                minHeight: 0,
              }}
            >
              <div className="px-4 pt-3 pb-2 flex items-center gap-2 border-b border-white/5">
                <span className="material-symbols-outlined text-[#D2EA7C] text-base" style={{ fontVariationSettings: "'FILL' 1" }}>lyrics</span>
                <span className="text-white/70 text-xs font-bold uppercase tracking-widest">Lyrics</span>
                {lyricsLoading && (
                  <div className="w-3 h-3 border-2 border-[#D2EA7C] border-t-transparent rounded-full animate-spin ml-auto" />
                )}
              </div>
              <div className="flex-1 overflow-y-auto inner-scroll px-4 py-3">
                {lyricsLoading ? (
                  <div className="h-full flex flex-col items-center justify-center gap-2 py-4">
                    <div className="w-6 h-6 border-2 border-[#D2EA7C] border-t-transparent rounded-full animate-spin" />
                    <p className="text-white/30 text-xs font-semibold">Fetching lyrics…</p>
                  </div>
                ) : lyrics ? (
                  <p className="text-white/85 text-sm leading-7 font-medium whitespace-pre-wrap">{lyrics}</p>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-2 py-4">
                    <span className="material-symbols-outlined text-white/10 text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>lyrics</span>
                    <p className="text-white/25 text-sm font-semibold text-center">No lyrics found for this track</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Mini Player bar (always visible) ───────────────────── */}
      <div
        className="fixed bottom-[65px] left-0 right-0 z-[60] flex flex-col gap-0 cursor-pointer"
        style={{
          background: 'rgba(10, 10, 18, 0.88)',
          backdropFilter: 'blur(30px) saturate(200%)',
          WebkitBackdropFilter: 'blur(30px) saturate(200%)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Tap zone (album art + title) → opens Now Playing */}
        <div className="flex items-center gap-3 px-3 pt-2.5 pb-1.5" onClick={openNowPlaying}>
          <img src={currentTrack.cover_url} alt={currentTrack.title}
            className="w-10 h-10 rounded-xl object-cover flex-shrink-0 shadow-md"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }} />

          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-white font-bold text-sm leading-tight truncate">{currentTrack.title}</span>
            <span className="text-white/40 text-[10px] truncate">{currentTrack.artist}</span>
          </div>

          {/* Quick controls — these don't propagate to open modal */}
          <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
            <button onClick={prev} className="p-1 text-white/60 active:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>skip_previous</span>
            </button>

            <button
              onClick={toggle}
              className="w-8 h-8 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform mx-0.5"
              style={{ background: '#D2EA7C' }}
            >
              <span className="material-symbols-outlined text-black text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>

            <button onClick={() => next(true)} className="p-1 text-white/60 active:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>skip_next</span>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full relative h-3 flex items-center cursor-pointer" onClick={e => e.stopPropagation()}>
          <div className="absolute left-0 right-0 h-0.5 bg-white/10 rounded-full pointer-events-none" />
          <div className="absolute left-0 h-0.5 rounded-full bg-[#D2EA7C] pointer-events-none" style={{ width: `${pct}%` }} />
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={progress || 0}
            onChange={(e) => seek(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer m-0 z-10 touch-none"
          />
        </div>
      </div>
    </>
  );
}
