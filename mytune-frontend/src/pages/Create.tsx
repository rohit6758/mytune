import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { usePlayer } from '../context/PlayerContext';

/* Brand gradient — Ultraviolet Sonic */
const BRAND_GRAD = 'linear-gradient(135deg, #FFF9EB 0%, #FFF9EB 50%, #FFF9EB 100%)';

export default function Create() {
  const [showImportModal, setShowImportModal] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importTitle, setImportTitle] = useState('');
  const [importArtist, setImportArtist] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  
  const { playTrack } = usePlayer();

  const handleImport = async () => {
    if (!importUrl || !importTitle || !importArtist) return;
    setIsImporting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');
      
      const newTrack = {
        user_id: user.id,
        track_id: `custom-${Date.now()}`,
        title: importTitle,
        artist: importArtist,
        cover_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80',
        preview_url: importUrl
      };
      
      const { error } = await supabase.from('library').insert(newTrack);
      if (error) throw error;
      
      alert('Track imported to your library successfully!');
      setShowImportModal(false);
      setImportUrl('');
      setImportTitle('');
      setImportArtist('');
    } catch (err: any) {
      alert('Error importing track: ' + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="inner-scroll h-full overflow-y-auto px-4 pt-5 pb-6 flex flex-col gap-6">

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center pt-6 pb-4">
        <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.6) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Ignite Your Sound
        </h2>
        <p className="text-base text-white/55 max-w-sm mx-auto leading-relaxed">
          Build the ultimate high-energy playlist, start a real-time jam session, or discover the raw tracks that fuel your momentum.
        </p>
      </section>

      {/* Creation Options Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto w-full">

        {/* Create New Playlist Card */}
        <button className="group relative flex flex-col items-start p-6 bg-[#1A1625] rounded-3xl hover:bg-[#252031] transition-all duration-500 shadow-xl overflow-hidden border border-white/5 hover:border-[#FFF9EB]/50 text-left">
          <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full blur-3xl opacity-10 group-hover:opacity-30 transition-opacity duration-500" style={{ background: BRAND_GRAD }} />
          {/* Icon */}
          <div className="relative z-10 p-4 rounded-2xl bg-[#110D17] border border-white/5 mb-5">
            <span className="material-symbols-outlined text-[40px]" style={{ fontVariationSettings: "'FILL' 1", background: BRAND_GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              queue_music
            </span>
          </div>
          <div className="relative z-10 w-full">
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#FFF9EB] transition-colors duration-300">Create New Playlist</h3>
            <p className="text-sm text-white/50 mb-5 leading-relaxed">Curate your aggression. Stack tracks for your next intense session.</p>
            <div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider w-full justify-center text-white active:scale-95 transition-transform"
              style={{ background: BRAND_GRAD }}
            >
              Build Now
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_forward</span>
            </div>
          </div>
        </button>

        {/* Start a Jam Card */}
        <button className="group relative flex flex-col items-start p-6 bg-[#1A1625] rounded-3xl hover:bg-[#252031] transition-all duration-500 shadow-xl overflow-hidden border border-white/5 hover:border-[#C5E384]/40 text-left">
          <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500 bg-[#C5E384]" />
          {/* Icon */}
          <div className="relative z-10 p-4 rounded-2xl bg-[#110D17] border border-white/5 mb-5">
            <span className="material-symbols-outlined text-[40px] text-[#C5E384]" style={{ fontVariationSettings: "'FILL' 1" }}>
              vital_signs
            </span>
          </div>
          <div className="relative z-10 w-full">
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#C5E384] transition-colors duration-300">Start a Jam</h3>
            <p className="text-sm text-white/50 mb-5 leading-relaxed">Real-time sync. High voltage collaborative listening starts here.</p>
            <div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider w-full justify-center text-black bg-[#C5E384] hover:bg-[#b0d600] active:scale-95 transition-all shadow-[0_4px_14px_0_rgba(208,255,0,0.2)]"
            >
              Sync Up
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>cell_tower</span>
            </div>
          </div>
        </button>

        {/* Add Music Card */}
        <button 
          onClick={() => setShowImportModal(true)}
          className="group relative flex flex-col items-start p-6 bg-[#1A1625] rounded-3xl hover:bg-[#252031] transition-all duration-500 shadow-xl overflow-hidden border border-white/5 hover:border-white/20 text-left sm:col-span-2 lg:col-span-1"
        >
          <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full blur-3xl opacity-5 group-hover:opacity-10 transition-opacity duration-500 bg-white" />
          {/* Icon */}
          <div className="relative z-10 p-4 rounded-2xl bg-[#110D17] border border-white/5 mb-5">
            <span className="material-symbols-outlined text-[40px] text-white/70" style={{ fontVariationSettings: "'FILL' 1" }}>
              audio_file
            </span>
          </div>
          <div className="relative z-10 w-full">
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-white transition-colors duration-300">Add Music</h3>
            <p className="text-sm text-white/50 mb-5 leading-relaxed">Upload raw cuts or import heavy tracks directly to your library.</p>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider w-full justify-center text-white border border-white/25 group-hover:bg-white group-hover:text-black active:scale-95 transition-all">
              Import Tracks
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>upload</span>
            </div>
          </div>
        </button>

      </section>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1625] border border-white/10 p-6 rounded-3xl w-full max-w-md shadow-2xl flex flex-col gap-4">
            <h3 className="text-2xl font-black text-white">Import Track</h3>
            <p className="text-sm text-white/60">Paste a direct MP3 or audio stream URL to add it to your library.</p>
            
            <input 
              value={importUrl} onChange={e => setImportUrl(e.target.value)}
              placeholder="Audio URL (e.g., https://example.com/song.mp3)"
              className="w-full bg-[#110D17] border border-white/10 rounded-xl p-3 text-white placeholder-white/30"
            />
            <input 
              value={importTitle} onChange={e => setImportTitle(e.target.value)}
              placeholder="Track Title"
              className="w-full bg-[#110D17] border border-white/10 rounded-xl p-3 text-white placeholder-white/30"
            />
            <input 
              value={importArtist} onChange={e => setImportArtist(e.target.value)}
              placeholder="Artist Name"
              className="w-full bg-[#110D17] border border-white/10 rounded-xl p-3 text-white placeholder-white/30"
            />
            
            <div className="flex gap-3 mt-2">
              <button onClick={() => setShowImportModal(false)} className="flex-1 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20">Cancel</button>
              <button onClick={handleImport} disabled={isImporting} className="flex-1 py-3 rounded-xl bg-[#FFF9EB] text-black font-bold hover:bg-[#e6e0d4]">
                {isImporting ? 'Importing...' : 'Save Track'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
