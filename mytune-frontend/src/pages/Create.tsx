/* Brand gradient — equal tangerine + red */
const BRAND_GRAD = 'linear-gradient(135deg, #FF9900 0%, #FF5520 50%, #FF2020 100%)';

export default function Create() {
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
        <button className="group relative flex flex-col items-start p-6 bg-[#0e0e0e] rounded-3xl hover:bg-[#131313] transition-all duration-500 shadow-xl overflow-hidden border border-white/5 hover:border-[#FF6820]/30 text-left">
          <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" style={{ background: BRAND_GRAD }} />
          {/* Icon */}
          <div className="relative z-10 p-4 rounded-2xl bg-[#1c1b1b] border border-white/5 mb-5">
            <span className="material-symbols-outlined text-[40px]" style={{ fontVariationSettings: "'FILL' 1", background: BRAND_GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              queue_music
            </span>
          </div>
          <div className="relative z-10 w-full">
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#FF9900] transition-colors duration-300">Create New Playlist</h3>
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
        <button className="group relative flex flex-col items-start p-6 bg-[#0e0e0e] rounded-3xl hover:bg-[#131313] transition-all duration-500 shadow-xl overflow-hidden border border-white/5 hover:border-[#FF3C20]/30 text-left">
          <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500 bg-[#FF3C20]" />
          {/* Icon */}
          <div className="relative z-10 p-4 rounded-2xl bg-[#1c1b1b] border border-white/5 mb-5">
            <span className="material-symbols-outlined text-[40px] text-[#FF3C20]" style={{ fontVariationSettings: "'FILL' 1" }}>
              vital_signs
            </span>
          </div>
          <div className="relative z-10 w-full">
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#FF3C20] transition-colors duration-300">Start a Jam</h3>
            <p className="text-sm text-white/50 mb-5 leading-relaxed">Real-time sync. High voltage collaborative listening starts here.</p>
            <div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider w-full justify-center text-white bg-[#FF3C20] hover:bg-[#d61a00] active:scale-95 transition-all"
            >
              Sync Up
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0" }}>cell_tower</span>
            </div>
          </div>
        </button>

        {/* Add Music Card */}
        <button className="group relative flex flex-col items-start p-6 bg-[#0e0e0e] rounded-3xl hover:bg-[#131313] transition-all duration-500 shadow-xl overflow-hidden border border-white/5 hover:border-white/20 text-left sm:col-span-2 lg:col-span-1">
          <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full blur-3xl opacity-5 group-hover:opacity-10 transition-opacity duration-500 bg-white" />
          {/* Icon */}
          <div className="relative z-10 p-4 rounded-2xl bg-[#1c1b1b] border border-white/5 mb-5">
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
    </div>
  );
}
