import React, { useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import type { Track } from '../context/PlayerContext';
import { supabase } from '../lib/supabase';

// Add global type for audio ref workaround
declare global {
  interface Window { _mytuneAudio?: HTMLAudioElement; }
}

export default function GlobalPlayer() {
  const {
    currentTrack, isPlaying, progress, duration,
    toggle, pause, resume, next, prev, seek,
    isShuffle, toggleShuffle, repeatMode, toggleRepeatMode,
  } = usePlayer();

  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [pendingTrack, setPendingTrack] = useState<Track | null>(null);
  const [userPlaylists, setUserPlaylists] = useState<any[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  // Listen for add-to-playlist events from Discover feed cards
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
        playlist_id: playlistId,
        user_id: user.id,
        track_id: track.id,
        title: track.title,
        artist: track.artist,
        cover_url: track.cover_url,
        preview_url: track.preview_url,
      });
      showToast('Added to playlist ✓');
    } catch (err) {
      console.error(err);
      showToast('Failed to add');
    }
    setShowPlaylistMenu(false);
    setPendingTrack(null);
  };

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek((parseFloat(e.target.value) / 100) * duration);
  };

  const fmt = (t: number) => {
    if (isNaN(t)) return '0:00';
    return `${Math.floor(t / 60)}:${Math.floor(t % 60).toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-[#FF9900] text-black font-bold text-sm px-5 py-2 rounded-full shadow-lg transition-all animate-bounce">
          {toast}
        </div>
      )}

      {/* Add to Playlist bottom sheet */}
      {showPlaylistMenu && (
        <div
          className="fixed inset-0 z-[150] flex items-end"
          onClick={() => { setShowPlaylistMenu(false); setPendingTrack(null); }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full bg-[#1a1a1a] border-t border-white/10 rounded-t-3xl p-6 shadow-2xl z-10 flex flex-col gap-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-2" />
            <h3 className="text-lg font-black text-white">Add to Playlist</h3>
            <p className="text-white/50 text-sm -mt-2 truncate">
              {(pendingTrack || currentTrack)?.title}
            </p>
            {userPlaylists.length === 0 ? (
              <p className="text-white/40 text-sm py-4 text-center">No playlists yet. Create one in the Create tab!</p>
            ) : (
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto no-scrollbar">
                {userPlaylists.map(pl => (
                  <button
                    key={pl.id}
                    onClick={() => addToPlaylist(pl.id)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 transition-colors text-left"
                  >
                    <span className="material-symbols-outlined text-[#FF9900] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>queue_music</span>
                    <span className="text-white font-semibold text-sm truncate">{pl.name}</span>
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => { setShowPlaylistMenu(false); setPendingTrack(null); }}
              className="w-full py-3 rounded-full bg-white/10 text-white/70 font-bold text-sm mt-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Mini Player bar — above bottom nav */}
      <div className="fixed bottom-[65px] left-0 right-0 z-[60] bg-black/80 backdrop-blur-xl border-t border-white/10 px-3 py-2 flex flex-col gap-0">
        
        {/* Progress bar at very top of player */}
        <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden mb-2">
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, #FF9900, #FF2020)',
            }}
          />
        </div>

        {/* Main row */}
        <div className="flex items-center gap-3">
          {/* Album thumb */}
          <img
            src={currentTrack.cover_url}
            alt={currentTrack.title}
            className="w-10 h-10 rounded-lg object-cover shadow-md flex-shrink-0"
          />

          {/* Track info */}
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-white font-bold text-sm leading-tight truncate">{currentTrack.title}</span>
            <span className="text-white/50 text-xs truncate">{currentTrack.artist}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={prev} className="p-1.5 text-white/60 active:text-white transition-colors">
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>skip_previous</span>
            </button>

            <button
              onClick={toggle}
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform mx-1"
              style={{ background: 'linear-gradient(135deg, #FF9900, #FF2020)' }}
            >
              <span className="material-symbols-outlined text-white text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>

            <button onClick={() => next(true)} className="p-1.5 text-white/60 active:text-white transition-colors">
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>skip_next</span>
            </button>

            <button
              onClick={() => { setPendingTrack(currentTrack); loadPlaylists(); setShowPlaylistMenu(true); }}
              className="p-1.5 text-white/60 active:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>playlist_add</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
