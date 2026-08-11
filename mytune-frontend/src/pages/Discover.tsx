import { useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import type { PanInfo } from 'framer-motion';

const MOCK_TRACKS = [
  {
    id: 1,
    title: 'Midnight City Flows',
    artist: 'The Neon Synthetics',
    tags: ['Electronic Pop', 'Chill'],
    bgImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuD7oSNvUX4pO6L9PHAtlaax3oRUPhu2BIH09LXaw--8N2qYSD4NqMJweU9UqsR8qd3Ig4q5ufgyAwJR0_SHqsAiSdHoPy3j1P9jJs0gD48BSt-mQm8rTjupFxK5tGVJ6arByk50bfPoyr8xE6KcX50OB8IFGyRmja2fzA7voabuzbm9HuoK6CzjJ1B2prSOUoEod1dCHhvhuo5XM0GpiXF0lEPX7Yd_evq3y1u4y34A0vApQDGMetZxFg",
    likes: '24.6K',
    comments: '1.2K',
  },
  {
    id: 2,
    title: 'Neon Circuitry',
    artist: 'Byte Shift',
    tags: ['Synthwave', 'Dark'],
    bgImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuBtfro2hwOapTOatiqSlwHnkblitbp8Jc-t9LrSQJq_7nLD3RSugNPpeZfVMU1HpoVwMZYF73y0cROOei4A2Fonx7TvmahFgt2kwLtnZhO8dCWkl_ePCkT4IcJp01lj3qftH3dF243vCxVeZ3EkG4KubEuxac2RXdYMzixig-sJxhgQaZBGK1AVUYjMrUbOWLm83TSHRoFRRXnKGzC78uJXsZQeLy_hnfXS-JkkyOLnf8C9g4ctIytOeQ",
    likes: '18.3K',
    comments: '903',
  },
  {
    id: 3,
    title: 'Velocity Drive',
    artist: 'Krome',
    tags: ['Hip-Hop', 'Energy'],
    bgImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuB6GDJr-cam4k1a0uJVmjJqNb78_5d3erWl2ggAG4vA_zeK3JrCkDbK0Xae69Ke-vcUN_HEs1m6JyLdScjMIjzg7VB2Ms1nl2N1_mqWZw4tWa1ZxHh6JsQpyRSX1droaLWfwCqsGN5rCQe2jEddFaIY0uYf_NqcHiz7RF6xXwo7DEzrqOfT9ukM32b2ztubihRkUVbiMA2BB6muxdOCbB6VPmRRAoY3b0uLyWH8-KaEHwbqAHaKoeWsrw",
    likes: '31.1K',
    comments: '2.4K',
  },
];

export default function Discover() {
  const [tracks] = useState(MOCK_TRACKS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likeOpacity, setLikeOpacity] = useState(0);
  const [skipOpacity, setSkipOpacity] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [liked, setLiked] = useState(false);
  const controls = useAnimation();
  const currentTrack = tracks[currentIndex];

  const handleDrag = (_e: any, info: PanInfo) => {
    const x = info.offset.x;
    const t = 80;
    if (x > 0) {
      setLikeOpacity(Math.min(x / t, 1));
      setSkipOpacity(0);
    } else {
      setSkipOpacity(Math.min(Math.abs(x) / t, 1));
      setLikeOpacity(0);
    }
  };

  const handleDragEnd = async (_e: any, info: PanInfo) => {
    const x = info.offset.x;
    if (x > 80) {
      await controls.start({ x: '120vw', opacity: 0, rotate: 20, transition: { duration: 0.3 } });
      nextTrack();
    } else if (x < -80) {
      await controls.start({ x: '-120vw', opacity: 0, rotate: -20, transition: { duration: 0.3 } });
      nextTrack();
    } else {
      controls.start({ x: 0, opacity: 1, rotate: 0 });
      setLikeOpacity(0);
      setSkipOpacity(0);
    }
  };

  const nextTrack = () => {
    setLikeOpacity(0);
    setSkipOpacity(0);
    setLiked(false);
    controls.set({ x: 0, opacity: 0, rotate: 0 });
    controls.start({ opacity: 1, transition: { duration: 0.25 } });
    setCurrentIndex(prev => (prev + 1) % tracks.length);
  };

  const handleLike = () => {
    setLiked(true);
    controls.start({ scale: [1, 1.04, 1], transition: { duration: 0.2 } });
  };

  const handleSkip = () => {
    controls.start({ x: '-120vw', opacity: 0, rotate: -20, transition: { duration: 0.3 } }).then(nextTrack);
  };

  if (!currentTrack) return null;

  return (
    // Strict full-viewport, no-scroll container
    <div
      className="relative w-screen bg-black overflow-hidden"
      style={{ height: 'calc(100dvh - 65px)', touchAction: 'pan-y' }}
    >
      {/* Blurred background to fill any gaps */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-110 blur-lg opacity-30"
        style={{ backgroundImage: `url(${currentTrack.bgImage})` }}
      />
      <div className="absolute inset-0 bg-black/60" />

      {/* Swipe Card — full-bleed, centered */}
      <motion.div
        key={currentTrack.id}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={controls}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
        style={{ touchAction: 'pan-y' }}
      >
        {/* Album art background — full bleed */}
        <img
          src={currentTrack.bgImage}
          alt={currentTrack.title}
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none"
          draggable={false}
        />

        {/* Dark gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent pointer-events-none h-1/3" />

        {/* LIKE stamp */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30"
          style={{ opacity: likeOpacity, transform: `translate(-50%, -50%) scale(${0.6 + likeOpacity * 0.4}) rotate(-12deg)` }}
        >
          <div className="border-4 border-[#ff9900] rounded-2xl px-6 py-3">
            <span className="text-[#ff9900] font-black text-3xl tracking-[0.3em] uppercase">LIKE</span>
          </div>
        </div>

        {/* NOPE stamp */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30"
          style={{ opacity: skipOpacity, transform: `translate(-50%, -50%) scale(${0.6 + skipOpacity * 0.4}) rotate(12deg)` }}
        >
          <div className="border-4 border-[#ff2020] rounded-2xl px-6 py-3">
            <span className="text-[#ff2020] font-black text-3xl tracking-[0.3em] uppercase">NOPE</span>
          </div>
        </div>

        {/* Top app bar — logo + notifications */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-4 pt-3 pb-2 z-20 pointer-events-none">
          <svg viewBox="0 0 100 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-20 h-9">
            <defs>
              <linearGradient id="navLogo" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF9900" />
                <stop offset="100%" stopColor="#FF2020" />
              </linearGradient>
            </defs>
            <rect x="2" y="10" width="4" height="16" rx="2" fill="url(#navLogo)" />
            <rect x="9" y="4" width="4" height="28" rx="2" fill="url(#navLogo)" />
            <path d="M16 30 L16 8 Q16 5 19 5 Q22 5 22 8 L22 20 Q22 24 25 24 Q28 24 28 20 L28 11 Q28 8 31 8 Q34 8 34 11 L34 20 Q34 24 37 24 Q40 24 40 20 L40 8 Q40 5 43 5 Q46 5 46 8 L46 30" stroke="url(#navLogo)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <rect x="50" y="4" width="4" height="28" rx="2" fill="url(#navLogo)" />
            <rect x="57" y="10" width="4" height="16" rx="2" fill="url(#navLogo)" />
            <text x="66" y="25" fontFamily="Montserrat, sans-serif" fontWeight="700" fontSize="15" fill="white" opacity="0.95">mytune</text>
          </svg>
          <button className="pointer-events-auto p-2 bg-black/30 backdrop-blur-sm rounded-full">
            <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 0" }}>notifications</span>
          </button>
        </div>

        {/* Right action column (TikTok-style) */}
        <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5 z-20 pointer-events-auto">
          {/* Artist avatar */}
          <div className="relative">
            <div className="w-11 h-11 rounded-full border-2 border-white bg-zinc-700 overflow-hidden">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoH5DXWGF9BHtLDzmnUXFQSTELuorBSj58CfLiplu4NpcdjvR_-Y57F6tQ6tuZpf6qc1dapffuzCHlt-6Npq5irb2GUMq5rpjzdxRHhufJbJ1DxwYlNaXU3aMdsH4x0oGqb1Gnhq4fg_n_694pnPoc9F5duHvESTs9CGtSEdp4GyMvcW04kvP50E-uVgWwgPxiTNv2Pe7fov4tRuFgxWdqUN0OfdfOpp9kfsbGsDBVU5AIqnLPq7qzLQ" alt="" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-gradient-to-br from-[#ff9900] to-[#ff2020] flex items-center justify-center border border-black">
              <span className="material-symbols-outlined text-white text-xs" style={{ fontVariationSettings: "'FILL' 1", fontSize: '12px' }}>add</span>
            </div>
          </div>

          {/* Like */}
          <button onClick={handleLike} className="flex flex-col items-center gap-1">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${liked ? 'bg-[#ff2020]' : 'bg-black/40 backdrop-blur-sm border border-white/20'}`}>
              <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
            </div>
            <span className="text-white text-[11px] font-semibold">{currentTrack.likes}</span>
          </button>

          {/* Comment */}
          <button className="flex flex-col items-center gap-1">
            <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
            </div>
            <span className="text-white text-[11px] font-semibold">{currentTrack.comments}</span>
          </button>

          {/* Share */}
          <button className="flex flex-col items-center gap-1">
            <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>share</span>
            </div>
            <span className="text-white text-[11px] font-semibold">Share</span>
          </button>
        </div>

        {/* Bottom info — track title, artist, tags, controls */}
        <div className="absolute bottom-6 left-0 right-14 px-4 flex flex-col gap-2 z-20 pointer-events-none">
          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            {currentTrack.tags.map(tag => (
              <span key={tag} className="bg-[#ff5540]/80 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow-xl">
            {currentTrack.title}
          </h2>

          {/* Artist */}
          <p className="text-sm font-semibold text-white/80">
            @{currentTrack.artist.toLowerCase().replace(/ /g, '_')}
          </p>

          {/* Progress bar */}
          <div className="w-full h-1 bg-white/20 rounded-full mt-1 overflow-hidden pointer-events-auto">
            <div className="h-full bg-gradient-to-r from-[#ff9900] to-[#ff2020] rounded-full w-2/5 animate-pulse" />
          </div>

          {/* Playback controls */}
          <div className="flex items-center gap-3 mt-1 pointer-events-auto">
            <button onClick={handleSkip} className="w-9 h-9 rounded-full bg-black/50 backdrop-blur border border-white/20 flex items-center justify-center active:scale-90 transition-transform">
              <span className="material-symbols-outlined text-white text-base" style={{ fontVariationSettings: "'FILL' 0" }}>close</span>
            </button>
            <button onClick={() => setIsPlaying(p => !p)} className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff9900] to-[#ff2020] flex items-center justify-center shadow-lg shadow-[#ff5540]/40 active:scale-90 transition-transform">
              <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>
            <button onClick={() => nextTrack()} className="w-9 h-9 rounded-full bg-black/50 backdrop-blur border border-white/20 flex items-center justify-center active:scale-90 transition-transform">
              <span className="material-symbols-outlined text-white text-base" style={{ fontVariationSettings: "'FILL' 0" }}>skip_next</span>
            </button>
            <span className="text-white/60 text-xs ml-auto font-mono">0:18 / 0:30</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
