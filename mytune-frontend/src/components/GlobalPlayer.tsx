import React, { useState, useEffect, useRef } from 'react';
import { usePlayer, Track } from '../context/PlayerContext';
import { supabase } from '../lib/supabase';
import clsx from 'clsx';

export default function GlobalPlayer() {
  const { currentTrack, isPlaying, progress, duration, repeatMode, isShuffle, toggle, next, prev, seek, toggleRepeatMode, toggleShuffle } = usePlayer();
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
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
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[300] bg-[#F5E642] text-black font-bold text-sm px-5 py-2 rounded-full shadow-lg">
          {toast}
        </div>
      )}

      {/* Playlist Menu Modal */}
      {showPlaylistMenu && (
        <div className="fixed inset-0 z-[250] flex items-end" onClick={() => { setShowPlaylistMenu(false); setPendingTrack(null); }}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />
          <div className="relative w-full rounded-t-3xl p-6 flex flex-col gap-4 z-10 glass-dark" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto -mt-1 mb-1" />
            <h3 className="text-lg font-black text-white">Add to Playlist</h3>
            <p className="text-white/40 text-sm -mt-2 truncate">{(pendingTrack || currentTrack)?.title}</p>
            {userPlaylists.length === 0 ? (
              <p className="text-white/30 text-sm py-4 text-center">No playlists yet.</p>
            ) : (
              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto inner-scroll">
                {userPlaylists.map(pl => (
                  <button key={pl.id} onClick={() => addToPlaylist(pl.id)} className="flex items-center gap-3 p-3 rounded-2xl glass-card text-left active:scale-95">
                    <span className="material-symbols-outlined text-[#F5E642]" style={{ fontVariationSettings: "'FILL' 1" }}>queue_music</span>
                    <span className="text-white font-semibold text-sm truncate">{pl.name}</span>
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => { setShowPlaylistMenu(false); setPendingTrack(null); }} className="w-full py-3 rounded-full glass text-white/60 font-bold text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Full Screen Player (Vivi Style) */}
      <div 
        className={clsx(
          "fixed inset-0 z-[150] transition-transform duration-300 ease-in-out flex flex-col",
          isExpanded ? "translate-y-0" : "translate-y-full"
        )}
        style={{
          background: `linear-gradient(to bottom, rgba(40,10,40,0.95), rgba(10,5,10,1))`,
          backdropFilter: 'blur(40px)',
        }}
      >
        {/* Top Bar */}
        <div className="flex justify-between items-center p-4 pt-safe">
          <button onClick={() => setIsExpanded(false)} className="p-2 text-white/70 active:text-white">
            <span className="material-symbols-outlined text-3xl">expand_more</span>
          </button>
          <div className="text-center">
            <p className="text-xs text-white/50 uppercase tracking-widest font-bold">Playing from Search</p>
            <p className="text-sm text-white font-bold truncate max-w-[200px]">YouTube Music</p>
          </div>
          <button className="p-2 text-white/70">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>

        {/* Album Art */}
        <div className="flex-1 flex items-center justify-center p-8 min-h-0">
          <img 
            src={currentTrack.cover_url} 
            alt={currentTrack.title} 
            className="w-full max-w-[320px] aspect-square object-cover rounded-xl shadow-2xl shadow-black/50"
            style={{ border: '1px solid rgba(255,255,255,0.05)' }}
          />
        </div>

        {/* Controls Section */}
        <div className="px-6 pb-6 flex flex-col gap-6">
          {/* Track Info */}
          <div className="flex justify-between items-center">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-white truncate">{currentTrack.title}</h2>
              <p className="text-base text-white/60 truncate">{currentTrack.artist}</p>
            </div>
            <button className="p-2 text-white/70 active:text-[#F5E642]">
              <span className="material-symbols-outlined text-3xl">add_circle</span>
            </button>
          </div>

          {/* Progress */}
          <div className="flex flex-col gap-2">
            <input 
              type="range" min="0" max={duration || 100} value={progress}
              onChange={(e) => seek(Number(e.target.value))}
              className="w-full h-1.5 bg-white/20 rounded-full appearance-none outline-none overflow-hidden"
              style={{
                boxShadow: `inset ${pct}% 0 0 0 #F5E642`
              }}
            />
            <div className="flex justify-between text-xs text-white/50 font-medium">
              <span>{fmt(progress)}</span>
              <span>{fmt(duration)}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex justify-between items-center px-2">
            <button onClick={toggleShuffle} className={clsx("p-2 transition-colors", isShuffle ? "text-[#F5E642]" : "text-white/50")}>
              <span className="material-symbols-outlined text-2xl">shuffle</span>
            </button>
            <button onClick={prev} className="p-2 text-white hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>skip_previous</span>
            </button>
            <button onClick={toggle} className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg active:scale-95 transition-transform">
              <span className="material-symbols-outlined text-black text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>
            <button onClick={() => next(true)} className="p-2 text-white hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>skip_next</span>
            </button>
            <button onClick={toggleRepeatMode} className={clsx("p-2 transition-colors relative", repeatMode !== 'off' ? "text-[#F5E642]" : "text-white/50")}>
              <span className="material-symbols-outlined text-2xl">{repeatMode === 'one' ? 'repeat_one' : 'repeat'}</span>
            </button>
          </div>
          
          {/* Bottom Actions */}
          <div className="flex justify-between items-center text-white/50 px-2 pt-2">
            <span className="material-symbols-outlined">speaker_group</span>
            <span className="material-symbols-outlined">share</span>
            <span className="material-symbols-outlined">menu</span>
          </div>

          {/* Lyrics Preview */}
          <div className="mt-2 p-4 rounded-2xl glass-card relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-t from-[#701540] to-[#a02050] opacity-80" />
             <div className="relative z-10">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-white font-bold">Lyrics preview</span>
                 <span className="material-symbols-outlined text-white/50 text-sm">open_in_full</span>
               </div>
               <p className="text-white/70 text-lg font-medium">♪ (Instrumental or lyrics unavailable for YT) ♪</p>
             </div>
          </div>
        </div>
      </div>

      {/* Mini Player — glass bar */}
      <div
        className={clsx(
          "fixed bottom-[65px] md:bottom-0 left-0 md:left-64 right-0 z-[60] px-3 py-2.5 flex flex-col gap-0 transition-transform duration-300",
          isExpanded ? "translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
        )}
        style={{
          background: 'rgba(10, 10, 18, 0.85)',
          backdropFilter: 'blur(30px) saturate(200%)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
        onClick={() => setIsExpanded(true)}
      >
        <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden mb-2.5">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#F5E642', transition: 'width 0.1s linear' }} />
        </div>

        <div className="flex items-center gap-3">
          <img src={currentTrack.cover_url} alt="" className="w-10 h-10 rounded-md object-cover flex-shrink-0 shadow-md border border-white/10" />

          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-white font-bold text-sm leading-tight truncate">{currentTrack.title}</span>
            <span className="text-white/50 text-xs truncate">{currentTrack.artist}</span>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
            <button onClick={prev} className="p-2 text-white/50 active:text-white"><span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>skip_previous</span></button>
            <button onClick={toggle} className="w-10 h-10 rounded-full bg-[#F5E642] flex items-center justify-center shadow-md active:scale-90 text-black">
              <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>{isPlaying ? 'pause' : 'play_arrow'}</span>
            </button>
            <button onClick={() => next(true)} className="p-2 text-white/50 active:text-white"><span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>skip_next</span></button>
          </div>
        </div>
      </div>
    </>
  );
}
