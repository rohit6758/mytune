import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function GlobalPlayer() {
  const { 
    currentTrack, isPlaying, progress, duration, pause, resume, next, prev, seek,
    isShuffle, toggleShuffle, repeatMode, toggleRepeatMode 
  } = usePlayer();
  
  const navigate = useNavigate();
  
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState<any[]>([]);

  const loadPlaylists = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('playlists').select('*').eq('user_id', user.id);
    if (data) setUserPlaylists(data);
  };

  const handlePlaylistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showPlaylistMenu) loadPlaylists();
    setShowPlaylistMenu(!showPlaylistMenu);
  };

  const addToPlaylist = async (playlistId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !currentTrack) return;
    try {
      await supabase.from('playlist_tracks').insert({
        playlist_id: playlistId,
        user_id: user.id,
        track_id: currentTrack.id,
        title: currentTrack.title,
        artist: currentTrack.artist,
        cover_url: currentTrack.cover_url,
        preview_url: currentTrack.preview_url
      });
      alert('Added to playlist!');
    } catch (err) {
      console.error(err);
    }
    setShowPlaylistMenu(false);
  };

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    seek(newTime);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handlePlayerClick = (e: React.MouseEvent) => {
    // Don't navigate if they clicked a button or range input
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) {
      return;
    }
    navigate('/discover');
  };

  return (
    <div 
      onClick={handlePlayerClick}
      className="fixed bottom-[72px] md:bottom-0 left-0 md:left-64 right-0 bg-black/60 backdrop-blur-xl border-t border-white/10 p-2 md:p-4 z-[60] flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 transition-all duration-300 cursor-pointer"
    >
      
      {/* Track Info */}
      <div className="flex items-center gap-3 w-full md:w-1/4 lg:w-1/3 min-w-0 px-2 md:px-0">
        <img 
          src={currentTrack.cover_url} 
          alt={currentTrack.title} 
          className="w-10 h-10 md:w-14 md:h-14 rounded-lg object-cover shadow-md"
        />
        <div className="flex flex-col min-w-0">
          <span className="text-white font-bold text-sm truncate">{currentTrack.title}</span>
          <span className="text-white/60 text-xs truncate">{currentTrack.artist}</span>
        </div>
        
        {/* Mobile Controls right side */}
        <div className="ml-auto flex md:hidden items-center gap-1 sm:gap-2">
          <button 
            onClick={toggleShuffle} 
            className={`p-1 transition-colors ${isShuffle ? 'text-[#C5E384]' : 'text-white/50'}`}
          >
            <span className="material-symbols-outlined text-[18px]">shuffle</span>
          </button>
          
          <button onClick={prev} className="p-1 text-white/70">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>skip_previous</span>
          </button>

          <button 
            onClick={isPlaying ? pause : resume} 
            className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-lg mx-1"
          >
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>

          <button onClick={() => next(true)} className="p-1 text-white/70">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>skip_next</span>
          </button>

          <button 
            onClick={toggleRepeatMode} 
            className={`p-1 transition-colors relative ${repeatMode !== 'off' ? 'text-[#C5E384]' : 'text-white/50'}`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {repeatMode === 'one' ? 'repeat_one' : 'repeat'}
            </span>
          </button>
        </div>
      </div>

      {/* Desktop Controls */}
      <div className="hidden md:flex flex-col items-center justify-center w-full md:w-2/4 lg:w-1/3 gap-1">
        <div className="flex items-center gap-4 md:gap-6">
          
          <button 
            onClick={toggleShuffle} 
            className={`transition-colors ${isShuffle ? 'text-[#C5E384]' : 'text-white/50 hover:text-white'}`}
          >
            <span className="material-symbols-outlined text-xl">shuffle</span>
          </button>

          <button onClick={prev} className="text-white/70 hover:text-white transition-colors">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>skip_previous</span>
          </button>
          
          <button 
            onClick={isPlaying ? pause : resume} 
            className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>
          
          <button onClick={() => next(true)} className="text-white/70 hover:text-white transition-colors">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>skip_next</span>
          </button>

          <button 
            onClick={toggleRepeatMode} 
            className={`transition-colors relative ${repeatMode !== 'off' ? 'text-[#C5E384]' : 'text-white/50 hover:text-white'}`}
          >
            <span className="material-symbols-outlined text-xl">
              {repeatMode === 'one' ? 'repeat_one' : 'repeat'}
            </span>
          </button>
        </div>

        {/* Progress Bar (Desktop only) */}
        <div className="hidden md:flex items-center gap-2 w-full max-w-md">
          <span className="text-[10px] text-white/50 w-8 text-right">{formatTime(progress)}</span>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={progressPercent}
            onChange={handleSeek}
            className="w-full h-1 bg-white/20 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full cursor-pointer hover:[&::-webkit-slider-thumb]:bg-[#C5E384]"
          />
          <span className="text-[10px] text-white/50 w-8">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right Actions (Desktop) */}
      <div className="hidden md:flex w-1/4 lg:w-1/3 justify-end px-4 gap-4 items-center relative">
        <button onClick={handlePlaylistClick} className="text-white/50 hover:text-white transition-colors relative">
          <span className="material-symbols-outlined text-xl">playlist_add</span>
        </button>
        
        {/* Playlist Popover */}
        {showPlaylistMenu && (
          <div className="absolute bottom-12 right-10 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100] flex flex-col p-2">
            <h4 className="text-xs font-bold text-white/50 px-2 pt-1 pb-2 uppercase tracking-wider">Add to Playlist</h4>
            {userPlaylists.length === 0 ? (
              <p className="text-xs text-white/40 px-2 pb-2">No playlists found.</p>
            ) : (
              <div className="max-h-40 overflow-y-auto no-scrollbar flex flex-col gap-1">
                {userPlaylists.map(pl => (
                  <button 
                    key={pl.id} 
                    onClick={(e) => { e.stopPropagation(); addToPlaylist(pl.id); }}
                    className="text-left px-2 py-1.5 text-sm text-white hover:bg-white/10 rounded-md truncate"
                  >
                    {pl.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <button className="text-white/50 hover:text-white">
          <span className="material-symbols-outlined text-xl">queue_music</span>
        </button>
        <button className="text-white/50 hover:text-white">
          <span className="material-symbols-outlined text-xl">volume_up</span>
        </button>
      </div>
      
      {/* Mobile Progress Bar (Absolute positioned at top of player) */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-white/10 md:hidden">
        <div 
          className="h-full bg-[#C5E384] transition-all duration-100 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
