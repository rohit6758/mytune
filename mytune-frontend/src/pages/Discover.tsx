import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Heart, X, Play, Pause, Share2, ListPlus } from 'lucide-react';

const MOCK_TRACKS = [
  {
    id: 1,
    title: 'Midnight City Flows',
    artist: 'The Neon Synthetics',
    tags: ['ELECTRONIC POP', 'CHILL'],
    color: 'from-purple-900 to-indigo-900',
  },
  {
    id: 2,
    title: 'Velocity Drive',
    artist: 'KROME',
    tags: ['SYNTHWAVE', 'UPBEAT'],
    color: 'from-red-900 to-orange-900',
  },
  {
    id: 3,
    title: 'Deep Code State',
    artist: 'Alex Mercer',
    tags: ['FOCUS', 'AMBIENT'],
    color: 'from-blue-900 to-cyan-900',
  }
];

export default function Discover() {
  const [tracks, setTracks] = useState(MOCK_TRACKS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 30 seconds
  
  const controls = useAnimation();
  const progressInterval = useRef<number | null>(null);

  const currentTrack = tracks[currentIndex];

  // 30-Second Constraint Logic
  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = window.setInterval(() => {
        setProgress((prev) => {
          if (prev >= 30) {
            // Stop playing when hitting 30 seconds constraint
            setIsPlaying(false);
            if (progressInterval.current) clearInterval(progressInterval.current);
            return 30;
          }
          return prev + 0.1;
        });
      }, 100);
    } else {
      if (progressInterval.current) clearInterval(progressInterval.current);
    }

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isPlaying]);

  const handleDragEnd = async (event: any, info: any) => {
    const swipeThreshold = 100;
    if (info.offset.x > swipeThreshold) {
      // Swiped Right (Like)
      await controls.start({ x: 500, opacity: 0, transition: { duration: 0.3 } });
      handleNextTrack();
    } else if (info.offset.x < -swipeThreshold) {
      // Swiped Left (Skip)
      await controls.start({ x: -500, opacity: 0, transition: { duration: 0.3 } });
      handleNextTrack();
    } else {
      // Return to center
      controls.start({ x: 0, opacity: 1 });
    }
  };

  const handleNextTrack = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentIndex((prev) => (prev + 1) % tracks.length);
    controls.set({ x: 0, opacity: 1 });
    // In a real app, we'd fetch more tracks here if we're near the end.
  };

  const togglePlay = () => {
    if (progress >= 30) {
      setProgress(0); // restart if it hit the limit
    }
    setIsPlaying(!isPlaying);
  };

  if (!currentTrack) return <div className="flex-1 flex items-center justify-center text-textMuted">No more tracks</div>;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Swipeable Card Area */}
      <div className="flex-1 w-full max-w-md max-h-[70vh] relative flex items-center justify-center">
        <motion.div
          key={currentTrack.id}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          animate={controls}
          className="w-full h-full aspect-[4/5] rounded-3xl overflow-hidden relative shadow-2xl cursor-grab active:cursor-grabbing bg-surface"
        >
          {/* Mock Album Art / Visualizer */}
          <div className={`absolute inset-0 bg-gradient-to-br ${currentTrack.color} opacity-80 mix-blend-screen`}></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-48 h-48 rounded-full border-4 border-white/10 flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                <div className="w-32 h-32 rounded-full border border-white/20 animate-pulse bg-white/5"></div>
             </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent pointer-events-none"></div>

          {/* Track Info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col z-10">
            <div className="flex gap-2 mb-3">
              {currentTrack.tags.map(tag => (
                <span key={tag} className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border border-primary/40 text-primary">
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="text-3xl font-display font-black tracking-tight text-white leading-tight drop-shadow-md">
              {currentTrack.title}
            </h2>
            <p className="text-textMuted font-medium mt-1">{currentTrack.artist}</p>
            
            {/* Small action row in card */}
            <div className="flex items-center gap-4 mt-6 text-textMuted">
              <button className="hover:text-white transition-colors"><Heart size={20} /></button>
              <button className="hover:text-white transition-colors"><Share2 size={20} /></button>
              <button className="hover:text-white transition-colors"><ListPlus size={20} /></button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Swipe Instructions */}
      <p className="text-xs tracking-[0.2em] font-bold text-textMuted mt-6 mb-4 uppercase">
        Swipe Right to Like, Left to Skip
      </p>

      {/* Controls & Progress */}
      <div className="w-full max-w-md flex flex-col items-center gap-6 z-10 pb-4">
        {/* Progress Bar (0 to 30s) */}
        <div className="w-full max-w-[280px] h-1 bg-surfaceHover rounded-full overflow-hidden">
           <div 
             className="h-full bg-primary transition-all duration-100 ease-linear"
             style={{ width: `${(progress / 30) * 100}%` }}
           ></div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-8 w-full">
          <button 
            onClick={() => handleNextTrack()} 
            className="w-14 h-14 rounded-full bg-surface hover:bg-surfaceHover border border-surfaceHover flex items-center justify-center text-red-500 transition-colors shadow-lg"
          >
            <X size={24} />
          </button>
          
          <button 
            onClick={togglePlay}
            className="w-20 h-20 rounded-full bg-surface flex items-center justify-center text-primary border border-surfaceHover hover:border-primary/50 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(255,107,0,0.2)]"
          >
            {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
          </button>
          
          <button 
            onClick={() => handleNextTrack()} // Mocking like as next for now
            className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-background transition-all shadow-lg shadow-primary/30 hover:scale-105"
          >
            <Heart size={32} />
          </button>
        </div>
      </div>

    </div>
  );
}
