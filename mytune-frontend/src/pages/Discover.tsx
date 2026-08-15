import { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { supabase } from '../lib/supabase';

const BRAND_GRAD = 'linear-gradient(135deg, #FF7000 0%, #FF3020 55%, #FF0000 100%)';

const DISCOVER_TERMS = ['pop', 'billboard', 'viral', 'top hits', 'hip hop', 'dance'];

export default function Discover() {
  const [tracks, setTracks]             = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likeOpacity,  setLikeOpacity]  = useState(0);
  const [skipOpacity,  setSkipOpacity]  = useState(0);
  const [isPlaying,    setIsPlaying]    = useState(true);
  const [liked,        setLiked]        = useState(false);
  const [loading,      setLoading]      = useState(true);
  
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  
  const controls = useAnimation();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch from iTunes API (Native CORS support, high reliability)
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const randomTerm = DISCOVER_TERMS[Math.floor(Math.random() * DISCOVER_TERMS.length)];
        const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(randomTerm)}&limit=25&media=music`;
        const res = await fetch(itunesUrl);
        const data = await res.json();
        
        if (data && data.results && data.results.length > 0) {
          const mapped = data.results.map((t: any) => ({
            id: t.trackId,
            title: t.trackName,
            artist: t.artistName,
            artistHandle: '@' + t.artistName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
            tags: ['Trending', t.primaryGenreName].filter(Boolean),
            bgImage: t.artworkUrl100 ? t.artworkUrl100.replace('100x100bb', '600x600bb') : '',
            previewUrl: t.previewUrl,
            likes: Math.floor(Math.random() * 50) + 'K', 
            comments: Math.floor(Math.random() * 5) + 'K'
          })).filter((t: any) => t.previewUrl && t.bgImage); // Ensure preview and image exist
          
          // Shuffle tracks array for more randomness
          const shuffled = mapped.sort(() => 0.5 - Math.random());
          setTracks(shuffled);
        }
      } catch (err) {
        console.error("Failed to fetch tracks from iTunes", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTracks();
  }, []);

  const currentTrack = tracks[currentIndex];

  // Handle Audio playback
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    
    if (isPlaying) {
      audioRef.current.play().catch(e => console.log('Autoplay prevented:', e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentIndex, currentTrack]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration || 30;
      setProgress((current / duration) * 100);
      
      const secs = Math.floor(current);
      setCurrentTime(`0:${secs < 10 ? '0' : ''}${secs}`);
    }
  };

  const saveToLibrary = async (track: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      await supabase.from('library').insert({
        user_id: user.id,
        track_id: String(track.id),
        title: track.title,
        artist: track.artist,
        cover_url: track.bgImage,
        preview_url: track.previewUrl
      });
      console.log('Saved to library');
    } catch (e) {
      console.error('Failed to save track', e);
    }
  };

  const handleDrag = (_e: any, info: PanInfo) => {
    const x = info.offset.x;
    const t = 80;
    if (x > 0) { setLikeOpacity(Math.min(x / t, 1)); setSkipOpacity(0); }
    else        { setSkipOpacity(Math.min(Math.abs(x) / t, 1)); setLikeOpacity(0); }
  };

  const handleDragEnd = async (_e: any, info: PanInfo) => {
    const x = info.offset.x;
    if      (x >  80) { await controls.start({ x: '130vw', opacity: 0, rotate: 18, transition: { duration: 0.35 } }); nextTrack(true); }
    else if (x < -80) { await controls.start({ x: '-130vw', opacity: 0, rotate: -18, transition: { duration: 0.35 } }); nextTrack(false); }
    else { controls.start({ x: 0, opacity: 1, rotate: 0, transition: { type: 'spring', stiffness: 300 } }); setLikeOpacity(0); setSkipOpacity(0); }
  };

  const nextTrack = (wasLiked: boolean = false) => {
    if (wasLiked && currentTrack) {
      saveToLibrary(currentTrack);
    }
    setLikeOpacity(0); setSkipOpacity(0); setLiked(false);
    controls.set({ x: 0, opacity: 0, rotate: 0 });
    controls.start({ opacity: 1, transition: { duration: 0.22 } });
    setCurrentIndex(prev => (prev + 1) % tracks.length);
    setProgress(0);
    setCurrentTime('0:00');
  };

  const handleLike  = () => { 
    setLiked(true); 
    saveToLibrary(currentTrack);
    controls.start({ scale: [1, 1.035, 1], transition: { duration: 0.18 } }); 
  };
  
  const handleSkip  = () => controls.start({ x: '-130vw', opacity: 0, rotate: -18, transition: { duration: 0.3 } }).then(() => nextTrack(false));

  if (loading) {
    return (
      <div className="relative w-full h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#FF3020] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentTrack) {
    return (
      <div className="relative w-full h-screen bg-[#0a0a0a] flex items-center justify-center text-white/50">
        No tracks available.
      </div>
    );
  }

  return (
    <div
      className="relative w-full bg-[#0a0a0a] overflow-hidden flex flex-col items-center justify-center"
      style={{ height: 'calc(100dvh - 62px)' }}
    >
      <audio 
        ref={audioRef} 
        src={currentTrack.previewUrl} 
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleSkip}
        loop={false}
      />

      {/* ── Ambient blurred background ───────────────────── */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-110"
        style={{
          backgroundImage: `url(${currentTrack.bgImage})`,
          filter: 'blur(32px) brightness(0.3) saturate(1.4)',
        }}
      />
      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent to-black/80 pointer-events-none" />

      {/* ── Top bar (Logo + Notifications) ─────────────── */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-5 pt-4 z-30 pointer-events-none">
        {/* Logo SVG inline (scaled-down) */}
        <svg viewBox="0 0 120 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-24 h-8">
          <defs>
            <linearGradient id="dLogo" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#FF7000" />
              <stop offset="55%"  stopColor="#FF3020" />
              <stop offset="100%" stopColor="#FF0000" />
            </linearGradient>
          </defs>
          <rect x="2"  y="10" width="4" height="16" rx="2" fill="url(#dLogo)" />
          <rect x="9"  y="4"  width="4" height="28" rx="2" fill="url(#dLogo)" />
          <path d="M16 30 L16 8 Q16 5 19 5 Q22 5 22 8 L22 20 Q22 24 25 24 Q28 24 28 20 L28 11 Q28 8 31 8 Q34 8 34 11 L34 20 Q34 24 37 24 Q40 24 40 20 L40 8 Q40 5 43 5 Q46 5 46 8 L46 30"
            stroke="url(#dLogo)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <rect x="50" y="4"  width="4" height="28" rx="2" fill="url(#dLogo)" />
          <rect x="57" y="10" width="4" height="16" rx="2" fill="url(#dLogo)" />
          <text x="66" y="25" fontFamily="Montserrat, sans-serif" fontWeight="700" fontSize="15" fill="white" opacity="0.9">mytune</text>
        </svg>
        <button className="pointer-events-auto p-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}>
          <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 0" }}>notifications</span>
        </button>
      </div>

      {/* ── SWIPE HINT ────────────────────────────────────── */}
      <p className="absolute bottom-4 left-0 right-0 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30 z-20 pointer-events-none">
        Swipe right to like · left to skip
      </p>

      {/* ══ GLASS CARD ══════════════════════════════════════ */}
      <motion.div
        key={currentTrack.id}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={controls}
        className="relative z-20 cursor-grab active:cursor-grabbing overflow-hidden"
        style={{
          /* Glass popup card sizing — responsive */
          width: 'min(88vw, 360px)',
          height: 'min(72vh, 560px)',
          borderRadius: '28px',
          /* Glassmorphism base */
          background: 'rgba(20, 20, 20, 0.55)',
          backdropFilter: 'blur(20px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
          /* Glow border */
          border: '1px solid rgba(255,255,255,0.14)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.12)',
          touchAction: 'pan-y',
        }}
      >
        {/* Album art — fills top 60% */}
        <div className="relative w-full overflow-hidden" style={{ height: '60%' }}>
          <img
            src={currentTrack.bgImage}
            alt={currentTrack.title}
            className="w-full h-full object-cover pointer-events-none select-none"
            draggable={false}
          />
          {/* Gradient fade into glass bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(12,12,12,0.8)]" />

          {/* LIKE stamp */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ opacity: likeOpacity }}
          >
            <div
              className="px-6 py-3 rounded-2xl"
              style={{
                border: '3px solid #FF9000',
                background: 'rgba(255,144,0,0.15)',
                backdropFilter: 'blur(4px)',
                transform: `rotate(-12deg) scale(${0.7 + likeOpacity * 0.3})`,
              }}
            >
              <span className="text-[#FF9000] font-black text-2xl tracking-[0.25em]">LIKE ♥</span>
            </div>
          </div>

          {/* NOPE stamp */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ opacity: skipOpacity }}
          >
            <div
              className="px-6 py-3 rounded-2xl"
              style={{
                border: '3px solid #FF1010',
                background: 'rgba(255,16,16,0.15)',
                backdropFilter: 'blur(4px)',
                transform: `rotate(12deg) scale(${0.7 + skipOpacity * 0.3})`,
              }}
            >
              <span className="text-[#FF1010] font-black text-2xl tracking-[0.25em]">NOPE ✕</span>
            </div>
          </div>

          {/* Tags top-left */}
          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap z-10">
            {currentTrack.tags.map((tag: string) => (
              <span
                key={tag}
                className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full text-white"
                style={{ background: 'rgba(255,48,32,0.75)', backdropFilter: 'blur(6px)' }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* ── Card info bottom 40% ─────────────────────── */}
        <div className="px-5 pt-4 pb-5 flex flex-col gap-3">
          {/* Track + actions row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-[18px] font-black text-white leading-tight truncate">{currentTrack.title}</h2>
              <p className="text-sm text-white/55 font-medium mt-0.5">{currentTrack.artistHandle}</p>
            </div>
            {/* Like action */}
            <button
              onClick={handleLike}
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={liked ? { background: BRAND_GRAD } : { background: 'rgba(255,255,255,0.08)' }}
            >
              <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-white/40 font-mono w-8">{currentTime}</span>
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.12)' }}>
              <div className="h-full rounded-full" style={{ background: BRAND_GRAD, width: `${progress}%` }} />
            </div>
            <span className="text-[11px] text-white/40 font-mono w-8 text-right">0:30</span>
          </div>

          {/* Playback controls */}
          <div className="flex items-center justify-between">
            <button onClick={handleSkip} className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 0" }}>close</span>
            </button>

            {/* Play/Pause — centre */}
            <button
              onClick={() => setIsPlaying(p => !p)}
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
              style={{ background: BRAND_GRAD, boxShadow: '0 8px 24px rgba(255,48,32,0.45)' }}
            >
              <span className="material-symbols-outlined text-white text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>

            <button onClick={() => nextTrack(false)} className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 0" }}>skip_next</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Side action column (share/comment) ─────────── */}
      <div className="absolute right-4 bottom-16 flex flex-col items-center gap-4 z-30">
        {/* Comment */}
        <button className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(8px)' }}>
            <span className="material-symbols-outlined text-white text-[18px]" style={{ fontVariationSettings: "'FILL' 0" }}>chat_bubble</span>
          </div>
          <span className="text-white/50 text-[10px] font-semibold">{currentTrack.comments}</span>
        </button>
        {/* Share */}
        <button className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(8px)' }}>
            <span className="material-symbols-outlined text-white text-[18px]" style={{ fontVariationSettings: "'FILL' 0" }}>share</span>
          </div>
          <span className="text-white/50 text-[10px] font-semibold">Share</span>
        </button>
      </div>
    </div>
  );
}
