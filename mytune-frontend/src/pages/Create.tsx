import { Music, UploadCloud, Radio } from 'lucide-react';

export default function Create() {
  return (
    <div className="w-full h-full max-w-4xl mx-auto p-4 md:p-8 flex flex-col items-center">
      
      <div className="text-center mt-8 mb-12">
        <h1 className="text-4xl font-display font-black tracking-tight mb-4 text-white drop-shadow-md">Ignite Your Sound</h1>
        <p className="text-textMuted text-lg max-w-xl mx-auto">
          Build the ultimate high-energy playlist, start a real-time jam session, or discover the raw tracks that fuel your momentum.
        </p>
      </div>

      <div className="w-full max-w-md flex flex-col gap-6 pb-12">
        
        {/* Create Playlist */}
        <div className="bg-surface p-6 rounded-2xl border border-surfaceHover hover:border-primary/50 transition-colors group cursor-pointer">
          <div className="w-14 h-14 bg-surfaceHover rounded-xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
            <Music size={28} />
          </div>
          <h2 className="text-2xl font-display font-bold mb-3">Create New Playlist</h2>
          <p className="text-textMuted mb-6 line-clamp-3">
            Curate your aggression. Stack tracks for your next intense session.
          </p>
          <button className="w-full py-3 bg-primary hover:bg-primaryHover text-background font-bold rounded-full transition-colors flex items-center justify-center gap-2 uppercase tracking-wide text-sm">
            Build Now <span className="text-lg">→</span>
          </button>
        </div>

        {/* Start a Jam */}
        <div className="bg-surface p-6 rounded-2xl border border-surfaceHover hover:border-red-500/50 transition-colors group cursor-pointer">
          <div className="w-14 h-14 bg-surfaceHover rounded-xl flex items-center justify-center mb-6 text-red-500 group-hover:scale-110 transition-transform">
            <Radio size={28} />
          </div>
          <h2 className="text-2xl font-display font-bold mb-3">Start a Jam</h2>
          <p className="text-textMuted mb-6 line-clamp-3">
            Real-time sync. High voltage collaborative listening starts here.
          </p>
          <button className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-full transition-colors flex items-center justify-center gap-2 uppercase tracking-wide text-sm shadow-[0_0_15px_rgba(220,38,38,0.3)]">
            Sync Up <Radio size={16} />
          </button>
        </div>

        {/* Add Music */}
        <div className="bg-surface p-6 rounded-2xl border border-surfaceHover hover:border-white/20 transition-colors group cursor-pointer">
          <div className="w-14 h-14 bg-surfaceHover rounded-xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
            <UploadCloud size={28} />
          </div>
          <h2 className="text-2xl font-display font-bold mb-3">Add Music</h2>
          <p className="text-textMuted mb-6 line-clamp-3">
            Upload raw cuts or import heavy tracks directly to your library. 
            <br/><span className="text-primary text-xs mt-2 block">(Max duration: 60s for short-form)</span>
          </p>
          <button className="w-full py-3 bg-transparent border border-surfaceHover hover:border-white text-white font-bold rounded-full transition-colors flex items-center justify-center gap-2 uppercase tracking-wide text-sm">
            Import Tracks <UploadCloud size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}
