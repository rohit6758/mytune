import { useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import type { PanInfo } from 'framer-motion';

const MOCK_TRACKS = [
  {
    id: 1,
    title: 'Midnight City Flows',
    artist: 'The Neon Synthetics',
    tags: ['Electronic Pop', 'Chill'],
    image: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD7oSNvUX4pO6L9PHAtlaax3oRUPhu2BIH09LXaw--8N2qYSD4NqMJweU9UqsR8qd3Ig4q5ufgyAwJR0_SHqsAiSdHoPy3j1P9jJs0gD48BSt-mQm8rTjupFxK5tGVJ6arByk50bfPoyr8xE6KcX50OB8IFGyRmja2fzA7voabuzbm9HuoK6CzjJ1B2prSOUoEod1dCHhvhuo5XM0GpiXF0lEPX7Yd_evq3y1u4y34A0vApQDGMetZxFg')",
    bg: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDdvLNAiXk0OW6ZI2RXD4f0Gup6xW0Z5OrPOxplcI7wEZEl4Y-Md0fmpbkjNpX5t-_0lDVAKknp0cuRbUbyL-v9JFYzL_C5KvXBxxu5PH2h9w8o7qNFZsOiemxM-7GrKlmn3GbJrodWd_DzhmsMdK6zk-xGR0bp-pF_ZF14YPYTEC7_pqODYLVgbacQNzI2ry6DA0-vyzt22N4Lwvb-cDbmgqn3K7BZsCIN8Bx6_4Ctm6OBi3wBhPtpAA')"
  }
];

export default function Discover() {
  const [tracks] = useState(MOCK_TRACKS);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [likeOpacity, setLikeOpacity] = useState(0);
  const [skipOpacity, setSkipOpacity] = useState(0);

  const controls = useAnimation();
  const currentTrack = tracks[currentIndex];

  const handleDrag = (_event: any, info: PanInfo) => {
    const x = info.offset.x;
    const threshold = 100;
    
    if (x > 0) {
      setLikeOpacity(Math.min(x / threshold, 1));
      setSkipOpacity(0);
    } else {
      setSkipOpacity(Math.min(Math.abs(x) / threshold, 1));
      setLikeOpacity(0);
    }
  };

  const handleDragEnd = async (_event: any, info: PanInfo) => {
    const threshold = 100;
    const x = info.offset.x;
    
    if (x > threshold) {
      await controls.start({ x: 500, opacity: 0, transition: { duration: 0.3 } });
      nextTrack();
    } else if (x < -threshold) {
      await controls.start({ x: -500, opacity: 0, transition: { duration: 0.3 } });
      nextTrack();
    } else {
      controls.start({ x: 0, opacity: 1 });
      setLikeOpacity(0);
      setSkipOpacity(0);
    }
  };

  const nextTrack = () => {
    controls.set({ x: 0, opacity: 1, scale: 0.9, y: 20 });
    controls.start({ scale: 1, y: 0, transition: { type: 'spring' } });
    setLikeOpacity(0);
    setSkipOpacity(0);
    // Loop for demo
    setCurrentIndex((prev) => (prev + 1) % tracks.length);
  };

  if (!currentTrack) return null;

  return (
    <div className="flex-grow flex flex-col items-center justify-center relative w-full h-full pt-10" style={{ touchAction: 'none' }}>
      
      {/* Swipe Container */}
      <div className="relative w-full max-w-sm aspect-[4/5] perspective-1000 flex items-center justify-center mb-10 z-10">
        
        {/* Background Card */}
        <div className="absolute inset-0 w-full h-full rounded-[24px] bg-zinc-900 shadow-sm transform scale-95 translate-y-4 opacity-70 overflow-hidden pointer-events-none transition-all duration-300">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: currentTrack.bg }}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        </div>
        
        {/* Active Card */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          animate={controls}
          className="absolute inset-0 w-full h-full rounded-[24px] shadow-[0_10px_40px_rgba(255,153,0,0.1)] overflow-hidden cursor-grab flex flex-col justify-end z-20"
          style={{ 
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 scale-105 pointer-events-none" style={{ backgroundImage: currentTrack.image }}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none"></div>
          
          <div className="relative z-10 p-6 flex flex-col gap-3 pointer-events-none">
            <div className="flex items-center gap-2 mb-1">
              {currentTrack.tags.map(tag => (
                <span key={tag} className="bg-black/60 backdrop-blur-md border border-[#FF9900]/40 text-[#FF9900] font-label-bold text-label-bold px-3 py-1.5 rounded-full uppercase tracking-wider text-[10px]">
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-[#FFFBF5] drop-shadow-lg leading-tight">
              {currentTrack.title}
            </h2>
            <p className="font-body-lg text-body-lg text-[#FFFBF5]/80 font-medium">
              {currentTrack.artist}
            </p>
          </div>

          {/* Like Stamp */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform" style={{ opacity: likeOpacity, transform: `translate(-50%, -50%) scale(${0.5 + likeOpacity * 0.5})` }}>
            <div className="bg-[#FF9900]/20 backdrop-blur-xl border-2 border-[#FF9900] w-32 h-32 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,153,0,0.5)]">
              <span className="material-symbols-outlined text-[#FF9900] text-6xl drop-shadow-md" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            </div>
          </div>
          
          {/* Nope Stamp */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform" style={{ opacity: skipOpacity, transform: `translate(-50%, -50%) scale(${0.5 + skipOpacity * 0.5})` }}>
            <div className="bg-[#FF0000]/20 backdrop-blur-xl border-2 border-[#FF0000] w-32 h-32 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,0,0,0.4)]">
              <span className="material-symbols-outlined text-[#FF0000] text-6xl drop-shadow-md" style={{ fontVariationSettings: "'FILL' 0" }}>close</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-8 w-full max-w-sm z-10 pb-8">
        <p className="font-label-bold text-label-bold text-[#FFFBF5]/60 uppercase tracking-[0.2em] text-[10px]">Swipe Right to Like, Left to Skip</p>
        <div className="flex justify-center items-center gap-6 w-full px-4">
          <button onClick={() => nextTrack()} className="w-16 h-16 rounded-full bg-zinc-900 shadow-sm border border-zinc-800 flex items-center justify-center text-[#FF0000] hover:bg-zinc-800 active:scale-90 transition-all duration-200 z-30">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 0" }}>close</span>
          </button>
          <button className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#FF9900] active:scale-90 transition-all duration-200 shadow-sm z-30">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
          </button>
          <button onClick={() => nextTrack()} className="w-20 h-20 rounded-full bg-[#FF9900] text-black shadow-[0_8px_30px_rgba(255,153,0,0.5)] flex items-center justify-center hover:opacity-95 active:scale-90 transition-all duration-200 z-30">
            <span className="material-symbols-outlined text-black text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
          </button>
        </div>
      </div>
    </div>
  );
}
