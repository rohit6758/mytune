import { useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import type { PanInfo } from 'framer-motion';

const MOCK_TRACKS = [
  {
    id: 1,
    title: 'Midnight City Flows',
    artist: 'The Neon Synthetics',
    artistHandle: '@neon_synthetics',
    tags: ['Electronic Pop', 'Chill'],
    bgImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuD7oSNvUX4pO6L9PHAtlaax3oRUPhu2BIH09LXaw--8N2qYSD4NqMJweU9UqsR8qd3Ig4q5ufgyAwJR0_SHqsAiSdHoPy3j1P9jJs0gD48BSt-mQm8rTjupFxK5tGVJ6arByk50bfPoyr8xE6KcX50OB8IFGyRmja2fzA7voabuzbm9HuoK6CzjJ1B2prSOUoEod1dCHhvhuo5XM0GpiXF0lEPX7Yd_evq3y1u4y34A0vApQDGMetZxFg",
    likes: '24.6K', comments: '1.2K',
  },
  {
    id: 2,
    title: 'Neon Circuitry',
    artist: 'Byte Shift',
    artistHandle: '@byte_shift',
    tags: ['Synthwave', 'Dark'],
    bgImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuBtfro2hwOapTOatiqSlwHnkblitbp8Jc-t9LrSQJq_7nLD3RSugNPpeZfVMU1HpoVwMZYF73y0cROOei4A2Fonx7TvmahFgt2kwLtnZhO8dCWkl_ePCkT4IcJp01lj3qftH3dF243vCxVeZ3EkG4KubEuxac2RXdYMzixig-sJxhgQaZBGK1AVUYjMrUbOWLm83TSHRoFRRXnKGzC78uJXsZQeLy_hnfXS-JkkyOLnf8C9g4ctIytOeQ",
    likes: '18.3K', comments: '903',
  },
  {
    id: 3,
    title: 'Velocity Drive',
    artist: 'Krome',
    artistHandle: '@krome_official',
    tags: ['Hip-Hop', 'Energy'],
    bgImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuB6GDJr-cam4k1a0uJVmjJqNb78_5d3erWl2ggAG4vA_zeK3JrCkDbK0Xae69Ke-vcUN_HEs1m6JyLdScjMIjzg7VB2Ms1nl2N1_mqWZw4tWa1ZxHh6JsQpyRSX1droaLWfwCqsGN5rCQe2jEddFaIY0uYf_NqcHiz7RF6xXwo7DEzrqOfT9ukM32b2ztubihRkUVbiMA2BB6muxdOCbB6VPmRRAoY3b0uLyWH8-KaEHwbqAHaKoeWsrw",
    likes: '31.1K', comments: '2.4K',
  },
];

const BRAND_GRAD = 'linear-gradient(135deg, #FF7000 0%, #FF3020 55%, #FF0000 100%)';

export default function Discover() {
  const [tracks]       = useState(MOCK_TRACKS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likeOpacity,  setLikeOpacity]  = useState(0);
  const [skipOpacity,  setSkipOpacity]  = useState(0);
  const [isPlaying,    setIsPlaying]    = useState(true);
  const [liked,        setLiked]        = useState(false);
  const controls = useAnimation();
  const currentTrack   = tracks[currentIndex];

  const handleDrag = (_e: any, info: PanInfo) => {
    const x = info.offset.x;
    const t = 80;
    if (x > 0) { setLikeOpacity(Math.min(x / t, 1)); setSkipOpacity(0); }
    else        { setSkipOpacity(Math.min(Math.abs(x) / t, 1)); setLikeOpacity(0); }
  };

  const handleDragEnd = async (_e: any, info: PanInfo) => {
    const x = info.offset.x;
    if      (x >  80) { await controls.start({ x: '130vw', opacity: 0, rotate: 18, transition: { duration: 0.35 } }); nextTrack(); }
    else if (x < -80) { await controls.start({ x: '-130vw', opacity: 0, rotate: -18, transition: { duration: 0.35 } }); nextTrack(); }
    else { controls.start({ x: 0, opacity: 1, rotate: 0, transition: { type: 'spring', stiffness: 300 } }); setLikeOpacity(0); setSkipOpacity(0); }
  };

  const nextTrack = () => {
    setLikeOpacity(0); setSkipOpacity(0); setLiked(false);
    controls.set({ x: 0, opacity: 0, rotate: 0 });
    controls.start({ opacity: 1, transition: { duration: 0.22 } });
    setCurrentIndex(prev => (prev + 1) % tracks.length);
  };

  const handleLike  = () => { setLiked(true); controls.start({ scale: [1, 1.035, 1], transition: { duration: 0.18 } }); };
  const handleSkip  = () => controls.start({ x: '-130vw', opacity: 0, rotate: -18, transition: { duration: 0.3 } }).then(nextTrack);

  if (!currentTrack) return null;

  return (
    <div
      className="relative w-full bg-[#0a0a0a] overflow-hidden flex flex-col items-center justify-center"
      style={{ height: 'calc(100dvh - 62px)' }}
    >
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
            {currentTrack.tags.map(tag => (
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
            <span className="text-[11px] text-white/40 font-mono w-8">0:18</span>
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.12)' }}>
              <div className="h-full rounded-full w-[60%]" style={{ background: BRAND_GRAD }} />
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

            <button onClick={() => nextTrack()} className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform" style={{ background: 'rgba(255,255,255,0.07)' }}>
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
