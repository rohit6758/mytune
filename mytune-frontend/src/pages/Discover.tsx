import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { usePlayer, Track } from '../context/PlayerContext';

const BRAND_GRAD = 'linear-gradient(135deg, #A855F7 0%, #8B16FF 50%, #5E00D4 100%)';

export default function Discover() {
  const { queue, currentTrack, playQueue, playTrack, addToQueue } = usePlayer();
  const [loading, setLoading] = useState(true);
  const [favoriteSinger, setFavoriteSinger] = useState('pop'); // Default
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Track liking state
  const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set());

  // 1. Fetch Profile to get favorite_singer
  useEffect(() => {
    const initDiscover = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.user_metadata?.favorite_singer) {
          setFavoriteSinger(user.user_metadata.favorite_singer);
          await fetchTracks(user.user_metadata.favorite_singer, true);
          return;
        }
        await fetchTracks('pop', true);
      } catch (err) {
        console.error('Discover init error', err);
        setLoading(false);
      }
    };
    
    // Only fetch if queue is empty (don't override existing session)
    if (queue.length === 0) {
      initDiscover();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchTracks = async (term: string, replaceQueue: boolean = false) => {
    try {
      const queryTerm = term.toLowerCase() === 'pop' ? 'hindi hit songs' : term;
      const saavnUrl = `https://saavn.sumit.co/api/search/songs?query=${encodeURIComponent(queryTerm)}`;
      const res = await fetch(saavnUrl);
      const json = await res.json();
      const data = json.data?.results;
      
      if (data && data.length > 0) {
        const mapped: Track[] = data.map((t: any) => {
           const imageArr = t.image || [];
           const dlArr = t.downloadUrl || [];
           return {
             id: String(t.id),
             title: t.name?.replace(/&quot;/g, '"') || 'Unknown',
             artist: t.artists?.primary?.[0]?.name || 'Unknown Artist',
             cover_url: imageArr.find((i: any) => i.quality === '500x500')?.url || imageArr[imageArr.length - 1]?.url || 'https://via.placeholder.com/500',
             preview_url: dlArr.find((d: any) => d.quality === '320kbps')?.url || dlArr[dlArr.length - 1]?.url || '',
           };
        }).filter((t: Track) => t.preview_url);
        
        // Shuffle
        const shuffled = mapped.sort(() => 0.5 - Math.random());
        
        if (replaceQueue) {
          playQueue(shuffled);
        } else {
          shuffled.forEach(t => addToQueue(t));
        }
      }
    } catch (err) {
      console.error("Failed to fetch tracks", err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll when currentTrack changes (e.g. from GlobalPlayer next button)
  useEffect(() => {
    if (currentTrack && scrollContainerRef.current) {
      const index = queue.findIndex(t => t.id === currentTrack.id);
      if (index !== -1) {
        const slide = scrollContainerRef.current.children[index] as HTMLElement;
        if (slide) {
          slide.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [currentTrack, queue]);

  // Handle intersection observer to update currentTrack when user scrolls
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const trackId = entry.target.getAttribute('data-track-id');
          if (trackId && currentTrack?.id !== trackId) {
            const track = queue.find(t => t.id === trackId);
            if (track) playTrack(track);
          }
        }
      });
    }, { threshold: 0.6 });

    Array.from(container.children).forEach(child => observer.observe(child));

    return () => observer.disconnect();
  }, [queue, currentTrack, playTrack]);

  const handleLike = async (track: Track) => {
    if (likedTracks.has(track.id)) return; // Already liked
    
    // Add to local state for fast UI update
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
          preview_url: track.preview_url
        });
        
        // Dynamic recommendation: fetch more by this artist
        fetchTracks(track.artist, false);
      } catch (e) {
        console.error('Failed to save track', e);
      }
    }
  };

  if (loading) {
    return (
      <div className="relative w-full h-screen bg-[#110D17] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#D0FF00] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (queue.length === 0) {
    return (
      <div className="relative w-full h-screen bg-[#110D17] flex items-center justify-center text-white/50">
        No tracks found for {favoriteSinger}.
      </div>
    );
  }

  return (
    <div 
      ref={scrollContainerRef}
      className="relative w-full h-[calc(100dvh-72px)] bg-[#110D17] overflow-y-scroll snap-y snap-mandatory no-scrollbar"
    >
      {queue.map((track) => {
        const isLiked = likedTracks.has(track.id);
        
        return (
          <div 
            key={track.id + Math.random()} // allow duplicates in queue safely
            data-track-id={track.id}
            className="w-full h-full snap-center relative overflow-hidden flex flex-col justify-end"
          >
            {/* Ambient blurred background */}
            <div
              className="absolute inset-0 bg-cover bg-center scale-110"
              style={{
                backgroundImage: `url(${track.cover_url})`,
                filter: 'blur(32px) brightness(0.3) saturate(1.4)',
              }}
            />
            {/* Vignette */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90 pointer-events-none" />

            {/* Track Info (bottom) */}
            <div className="relative z-10 px-6 pb-24 md:pb-32 flex justify-between items-end">
              <div className="flex-1 min-w-0 pr-4">
                <img 
                  src={track.cover_url} 
                  className="w-24 h-24 md:w-48 md:h-48 rounded-xl shadow-2xl mb-4 border border-white/10" 
                  alt="cover" 
                />
                <h2 className="text-3xl md:text-5xl font-black text-white leading-tight truncate">{track.title}</h2>
                <p className="text-lg md:text-xl text-white/70 font-medium mt-1 truncate">@{track.artist.toLowerCase().replace(/\s+/g, '')}</p>
              </div>

              {/* Actions Right Column */}
              <div className="flex flex-col gap-6 items-center">
                <button
                  onClick={() => handleLike(track)}
                  className="w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-2xl"
                  style={{ background: isLiked ? BRAND_GRAD : 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}
                >
                  <span className="material-symbols-outlined text-[28px] text-white" style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                </button>
                <span className="text-white/50 text-xs font-bold -mt-4">{isLiked ? 'Liked' : 'Like'}</span>

                <button className="w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                  <span className="material-symbols-outlined text-white text-[24px]">share</span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
