import React, { useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import type { Track } from '../context/PlayerContext';
import { supabase } from '../lib/supabase';

declare global { interface Window { _mytuneAudio?: HTMLAudioElement; } }

export default function GlobalPlayer() {
  const { currentTrack, isPlaying, progress, duration, toggle, next, prev, seek, isShuffle, toggleShuffle, repeatMode, toggleRepeatMode } = usePlayer();
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [pendingTrack, setPendingTrack] = useState<Track | null>(null);
  const [userPlaylists, setUserPlaylists] = useState<any[]>([]);
  const [toast, setToast] = useState<string | null>(null);

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

  if (!currentTrack) return null;

  const pct = duration > 0 ? (progress / duration) * 100 : 0;
  const fmt = (t: number) => isNaN(t) ? '0:00' : `${Math.floor(t / 60)}:${Math.floor(t % 60).toString().padStart(2, '0')}`;

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-[#F5E642] text-black font-bold text-sm px-5 py-2 rounded-full shadow-lg">
          {toast}
        </div>
      )}

      {/* Add to Playlist — glass bottom sheet */}
      {showPlaylistMenu && (
        <div className="fixed inset-0 z-[150] flex items-end" onClick={() => { setShowPlaylistMenu(false); setPendingTrack(null); }}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />
          <div
            className="relative w-full rounded-t-3xl p-6 flex flex-col gap-4 z-10"
            style={{
              background: 'rgba(16, 14, 24, 0.85)',
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
                    <span className="material-symbols-outlined text-[#F5E642] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>queue_music</span>
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

      {/* Mini Player — glass bar above bottom nav */}
      <div
        className="fixed bottom-[65px] left-0 right-0 z-[60] px-3 py-2.5 flex flex-col gap-0"
        style={{
          background: 'rgba(10, 10, 18, 0.8)',
          backdropFilter: 'blur(30px) saturate(200%)',
          WebkitBackdropFilter: 'blur(30px) saturate(200%)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Yellow progress bar */}
        <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden mb-2.5">
          <div
            className="h-full rounded-full"
            style={{ width: `${pct}%`, background: '#F5E642', transition: 'width 0.1s linear' }}
          />
        </div>

        <div className="flex items-center gap-3">
          <img src={currentTrack.cover_url} alt={currentTrack.title}
            className="w-10 h-10 rounded-xl object-cover flex-shrink-0 shadow-md"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }} />

          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-white font-bold text-sm leading-tight truncate">{currentTrack.title}</span>
            <span className="text-white/40 text-[10px] truncate">{currentTrack.artist}</span>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={toggleShuffle} className={`p-1 transition-colors ${isShuffle ? 'text-[#F5E642]' : 'text-white/40 active:text-white'}`}>
              <span className="material-symbols-outlined text-[18px]">shuffle</span>
            </button>
            
            <button onClick={prev} className="p-1 text-white/60 active:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>skip_previous</span>
            </button>

            <button
              onClick={toggle}
              className="w-8 h-8 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform mx-0.5"
              style={{ background: '#F5E642' }}
            >
              <span className="material-symbols-outlined text-black text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>

            <button onClick={() => next(true)} className="p-1 text-white/60 active:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>skip_next</span>
            </button>

            <button onClick={toggleRepeatMode} className={`p-1 transition-colors ${repeatMode !== 'off' ? 'text-[#F5E642]' : 'text-white/40 active:text-white'}`}>
              <span className="material-symbols-outlined text-[18px]">
                {repeatMode === 'one' ? 'repeat_one' : 'repeat'}
              </span>
            </button>
            
            <button
              onClick={() => { setPendingTrack(currentTrack); loadPlaylists(); setShowPlaylistMenu(true); }}
              className="p-1 pl-2 border-l border-white/10 ml-1 text-white/50 active:text-[#F5E642] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 0" }}>playlist_add</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
