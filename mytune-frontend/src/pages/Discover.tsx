import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { usePlayer, Track } from '../context/PlayerContext';

export default function Discover() {
  const { queue, currentTrack, loadQueue, playTrack, playQueue, next, toggle, isPlaying, addToQueue, insertNext } = usePlayer();
  const [loading, setLoading] = useState(true);
  const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch tracks on mount — use loadQueue (NO auto-play)
  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const singer = user?.user_metadata?.favorite_singer || 'pop';
        await fetchTracks(singer, 'replace');
      } catch (err) {
        console.error('Discover init error', err);
        setLoading(false);
      }
    };

    if (queue.length === 0) init();
    else setLoading(false);
  }, []);

  const fetchTracks = async (term: string, action: 'replace' | 'append' | 'insertNext' = 'append') => {
    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&limit=30&media=music`;
      const res = await fetch(url);
      const data = await res.json();

      if (data?.results?.length > 0) {
        const mapped: Track[] = data.results
          .map((t: any) => ({
            id: String(t.trackId),
            title: t.trackName,
            artist: t.artistName,
            cover_url: t.artworkUrl100?.replace('100x100bb', '600x600bb') || '',
            preview_url: t.previewUrl || '',
          }))
          .filter((t: Track) => t.preview_url && t.cover_url);

        const shuffled = [...mapped].sort(() => 0.5 - Math.random());

        if (action === 'replace') {
          loadQueue(shuffled); // ← NO auto-play on first load
        } else if (action === 'insertNext') {
          insertNext(shuffled);
        } else {
          shuffled.forEach(t => addToQueue(t));
        }
      }
    } catch (err) {
      console.error('Failed to fetch tracks', err);
    } finally {
      setLoading(false);
    }
  };

  // Sync scroll position when currentTrack changes from GlobalPlayer controls
  useEffect(() => {
    if (currentTrack && scrollContainerRef.current) {
      const index = queue.findIndex(t => t.id === currentTrack.id);
      if (index !== -1) {
        const slide = scrollContainerRef.current.children[index] as HTMLElement;
        const container = scrollContainerRef.current;
        if (Math.abs(container.scrollTop - slide.offsetTop) > 10) {
          slide?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [currentTrack]);

  // IntersectionObserver — change track when user scrolls to a new card
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || queue.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const trackId = entry.target.getAttribute('data-track-id');
          if (trackId && currentTrack?.id !== trackId) {
            const index = queue.findIndex(t => t.id === trackId);
            if (index !== -1) {
               playQueue(queue, index);
            }
          }
        }
      });
    }, { threshold: 0.65, rootMargin: '0px' });

    Array.from(container.children).forEach(child => observer.observe(child));
    return () => observer.disconnect();
  }, [queue, currentTrack]);

  const handleLike = async (track: Track) => {
    if (likedTracks.has(track.id)) return;
    setLikedTracks(prev => new Set(prev).add(track.id));

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      try {
        await supabase.from('library').insert({
          user_id: user.id,
          track_id: track.id,
          title: track.title,
          artist: track.artist,
          cover_url: track.cover_url,
          preview_url: track.preview_url,
        });
        // Recommend more from this artist (insert after current position)
        fetchTracks(track.artist, 'insertNext');
      } catch (e) {
        console.error('Failed to save track', e);
      }
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ background: '#0a0a0f' }}>
        <div className="w-10 h-10 border-4 border-[#D2EA7C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (queue.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white/50 p-8 text-center" style={{ background: '#0a0a0f' }}>
        <span className="material-symbols-outlined text-5xl text-[#D2EA7C]">music_off</span>
        <p>No tracks found. Try searching for something!</p>
      </div>
    );
  }


  return (
    <div
      ref={scrollContainerRef}
      className="relative w-full h-full bg-black overflow-y-scroll snap-y snap-mandatory no-scrollbar"
      style={{ touchAction: 'pan-y' }}
    >
      {queue.map((track) => {
        const isLiked = likedTracks.has(track.id);
        const isCurrent = currentTrack?.id === track.id;

        return (
          <div
            key={track.id}
            data-track-id={track.id}
            className="relative w-full h-full snap-center flex-shrink-0 overflow-hidden"
          >
            {/* Full-bleed ambient background */}
            <div
              className="absolute inset-0 bg-cover bg-center scale-110"
              style={{
                backgroundImage: `url(${track.cover_url})`,
                filter: 'blur(28px) brightness(0.25) saturate(1.5)',
              }}
            />
            {/* Vignette */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/95 pointer-events-none" />

            {/* Album art — centered upper half */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ paddingBottom: '45%' }}>
              <img
                src={track.cover_url}
                className="w-52 h-52 sm:w-64 sm:h-64 rounded-2xl shadow-2xl object-cover border border-white/10"
                alt={track.title}
                draggable={false}
              />
            </div>

            {/* Bottom info row */}
            <div className="absolute bottom-0 left-0 right-0 px-4 pb-[140px] md:pb-[90px] flex flex-row items-end justify-between gap-2 pointer-events-none">
              
              {/* Left: Track info + controls */}
              <div className="flex-1 min-w-0 flex flex-col gap-2 pointer-events-auto">
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                  {track.title}
                </h2>
                <p className="text-sm text-white/70 font-semibold truncate">
                  @{track.artist.toLowerCase().replace(/\s+/g, '')}
                </p>

                {/* Play/Pause + Skip — only on current card */}
                {isCurrent && (
                  <div className="flex items-center gap-3 mt-1">
                    <button
                      onClick={() => toggle()}
                      className="w-12 h-12 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                      style={{ background: '#D2EA7C', boxShadow: '0 4px 20px rgba(245,230,66,0.35)' }}
                    >
                      <span className="material-symbols-outlined text-black text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {isPlaying ? 'pause' : 'play_arrow'}
                      </span>
                    </button>
                    <button
                      onClick={() => next(true)}
                      className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                      style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)' }}
                    >
                      <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>skip_next</span>
                    </button>
                  </div>
                )}

                {/* Tap to play — when not current */}
                {!isCurrent && (
                  <button
                    onClick={() => {
                      const idx = queue.findIndex(t => t.id === track.id);
                      playQueue(queue, idx);
                    }}
                    className="self-start mt-1 flex items-center gap-2 px-4 py-2 rounded-full text-black text-sm font-bold active:scale-95 transition-transform"
                    style={{ background: '#D2EA7C', boxShadow: '0 2px 12px rgba(245,230,66,0.3)' }}
                  >
                    <span className="material-symbols-outlined text-black text-base" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                    Play
                  </button>
                )}
              </div>

              {/* Right: Vertical action column */}
              <div className="flex flex-col items-center gap-4 pb-1 flex-shrink-0 pointer-events-auto">
                {/* Like */}
                <div className="flex flex-col items-center gap-0.5">
                  <button
                    onClick={() => handleLike(track)}
                    className="w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg"
                    style={{
                      background: isLiked ? '#D2EA7C' : 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      boxShadow: isLiked ? '0 0 16px rgba(245,230,66,0.4)' : 'none',
                    }}
                  >
                    <span
                      className="material-symbols-outlined text-[22px]"
                      style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0", color: isLiked ? '#0a0a0f' : 'white' }}
                    >
                      favorite
                    </span>
                  </button>
                  <span className="text-white/70 text-[10px] font-bold">{isLiked ? 'Liked' : 'Like'}</span>
                </div>

                {/* Add to playlist */}
                <div className="flex flex-col items-center gap-0.5">
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('mytune:add-to-playlist', { detail: track }))}
                    className="w-11 h-11 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                    style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' }}
                  >
                    <span className="material-symbols-outlined text-white text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>playlist_add</span>
                  </button>
                  <span className="text-white/70 text-[10px] font-bold">Save</span>
                </div>

                {/* Share */}
                <div className="flex flex-col items-center gap-0.5">
                  <button
                    onClick={() => navigator.share?.({ title: track.title, text: `Listen to ${track.title} by ${track.artist} on MyTune` })}
                    className="w-11 h-11 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                    style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' }}
                  >
                    <span className="material-symbols-outlined text-white text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>share</span>
                  </button>
                  <span className="text-white/70 text-[10px] font-bold">Share</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
