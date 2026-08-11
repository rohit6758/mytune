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
    setCurrentIndex((prev) => (prev + 1) % tracks.length);
  };

  if (!currentTrack) return null;

  return (
    <div className="flex-grow relative w-full h-[calc(100vh-70px)] md:h-full bg-black overflow-hidden" style={{ touchAction: 'none' }}>
      
      {/* Background Card for next item */}
      <div className="absolute inset-0 w-full h-full bg-black transform scale-95 translate-y-4 opacity-50 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: currentTrack.bg }}></div>
      </div>
      
      {/* Active Swipe Card - Full Screen Immersive */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={controls}
        className="absolute inset-0 w-full h-full md:rounded-3xl shadow-2xl cursor-grab z-20 md:max-w-md md:mx-auto md:h-[90%] md:top-[5%]"
        style={{ background: '#000' }}
      >
        {/* Album Cover Background (Full bleed) */}
        <div className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-80" style={{ backgroundImage: currentTrack.image }}></div>
        
        {/* Gradient overlays to make text pop - Red & Tangerine tint at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#ff5540]/30 to-transparent pointer-events-none opacity-60"></div>
        
        {/* Content area at the bottom */}
        <div className="absolute bottom-24 left-0 right-0 p-6 flex flex-col gap-3 pointer-events-none">
          <div className="flex items-center gap-2 mb-2">
            {currentTrack.tags.map(tag => (
              <span key={tag} className="bg-[#ff5540]/80 backdrop-blur-md text-white font-bold px-3 py-1 rounded-full uppercase tracking-widest text-[10px]">
                {tag}
              </span>
            ))}
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-xl leading-tight">
            {currentTrack.title}
          </h2>
          <p className="text-xl text-white/90 font-semibold drop-shadow-md">
            {currentTrack.artist}
          </p>
        </div>

        {/* Like Stamp */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform" style={{ opacity: likeOpacity, transform: `translate(-50%, -50%) scale(${0.5 + likeOpacity * 0.5}) rotate(15deg)` }}>
          <div className="bg-[#ff9900]/90 backdrop-blur-xl border-4 border-[#ff9900] px-8 py-4 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(255,153,0,0.8)]">
            <span className="text-black font-black text-5xl uppercase tracking-widest">LIKE</span>
          </div>
        </div>
        
        {/* Nope Stamp */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform" style={{ opacity: skipOpacity, transform: `translate(-50%, -50%) scale(${0.5 + skipOpacity * 0.5}) rotate(-15deg)` }}>
          <div className="bg-[#ff0000]/90 backdrop-blur-xl border-4 border-[#ff0000] px-8 py-4 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(255,0,0,0.8)]">
            <span className="text-white font-black text-5xl uppercase tracking-widest">NOPE</span>
          </div>
        </div>

        {/* Floating Action Buttons */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-4 z-30 pointer-events-auto">
          <button onClick={() => nextTrack()} className="w-12 h-12 rounded-full bg-black/60 backdrop-blur border border-white/20 flex items-center justify-center text-white active:scale-90 transition-transform shadow-lg">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
          </button>
          <button className="w-12 h-12 rounded-full bg-black/60 backdrop-blur border border-white/20 flex items-center justify-center text-white active:scale-90 transition-transform shadow-lg">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
          </button>
          <button className="w-12 h-12 rounded-full bg-black/60 backdrop-blur border border-white/20 flex items-center justify-center text-white active:scale-90 transition-transform shadow-lg">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>share</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
