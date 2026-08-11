export default function Create() {
  return (
    <div className="px-margin-mobile pt-lg flex flex-col gap-2xl pb-10">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center pt-md pb-lg">
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-transparent bg-clip-text bg-gradient-to-br from-white to-on-surface-variant mb-md">
          Ignite Your Sound
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto">
          Build the ultimate high-energy playlist, start a real-time jam session, or discover the raw tracks that fuel your momentum.
        </p>
      </section>

      {/* Creation Options Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md max-w-7xl mx-auto w-full">
        
        {/* Create New Playlist Card */}
        <button className="group relative flex flex-col items-start p-lg bg-surface-container-lowest rounded-3xl hover:bg-surface transition-all duration-500 shadow-xl shadow-black/50 overflow-hidden border border-surface-container/30 hover:border-primary-container/50">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary-container/10 rounded-full blur-3xl group-hover:bg-primary-container/20 transition-colors duration-500"></div>
          <div className="mb-auto relative z-10 p-4 rounded-2xl bg-gradient-to-br from-surface-container to-surface-container-low mb-lg border border-surface-container/50">
            <span className="material-symbols-outlined text-[40px] text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>queue_music</span>
          </div>
          <div className="relative z-10 w-full text-left">
            <h3 className="font-headline-md text-headline-md text-on-background mb-sm group-hover:text-primary-container transition-colors duration-300">Create New Playlist</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-lg">Curate your aggression. Stack tracks for your next intense session.</p>
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary-container to-[#ff7a00] text-black font-label-bold text-label-bold uppercase tracking-wider group-hover:shadow-[0_0_20px_rgba(255,153,0,0.4)] transition-all duration-300 w-full justify-center">
              Build Now
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </div>
          </div>
        </button>

        {/* Start a Jam Card */}
        <button className="group relative flex flex-col items-start p-lg bg-surface-container-lowest rounded-3xl hover:bg-surface transition-all duration-500 shadow-xl shadow-black/50 overflow-hidden border border-surface-container/30 hover:border-secondary-container/50">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-secondary-container/10 rounded-full blur-3xl group-hover:bg-secondary-container/20 transition-colors duration-500"></div>
          <div className="mb-auto relative z-10 p-4 rounded-2xl bg-gradient-to-br from-surface-container to-surface-container-low mb-lg border border-surface-container/50">
            <span className="material-symbols-outlined text-[40px] text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>vital_signs</span>
          </div>
          <div className="relative z-10 w-full text-left">
            <h3 className="font-headline-md text-headline-md text-on-background mb-sm group-hover:text-secondary-container transition-colors duration-300">Start a Jam</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-lg">Real-time sync. High voltage collaborative listening starts here.</p>
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-secondary-container to-[#d61a00] text-white font-label-bold text-label-bold uppercase tracking-wider group-hover:shadow-[0_0_20px_rgba(255,85,64,0.4)] transition-all duration-300 w-full justify-center">
              Sync Up
              <span className="material-symbols-outlined text-sm">cell_tower</span>
            </div>
          </div>
        </button>

        {/* Add Music Card */}
        <button className="group relative flex flex-col items-start p-lg bg-surface-container-lowest rounded-3xl hover:bg-surface transition-all duration-500 shadow-xl shadow-black/50 overflow-hidden border border-surface-container/30 hover:border-on-background/50 md:col-span-2 lg:col-span-1">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors duration-500"></div>
          <div className="mb-auto relative z-10 p-4 rounded-2xl bg-gradient-to-br from-surface-container to-surface-container-low mb-lg border border-surface-container/50">
            <span className="material-symbols-outlined text-[40px] text-on-background" style={{ fontVariationSettings: "'FILL' 1" }}>audio_file</span>
          </div>
          <div className="relative z-10 w-full text-left">
            <h3 className="font-headline-md text-headline-md text-on-background mb-sm group-hover:text-white transition-colors duration-300">Add Music</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-lg">Upload raw cuts or import heavy tracks directly to your library.</p>
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-on-background/30 text-on-background font-label-bold text-label-bold uppercase tracking-wider group-hover:bg-on-background group-hover:text-background transition-colors duration-300 w-full justify-center">
              Import Tracks
              <span className="material-symbols-outlined text-sm">upload</span>
            </div>
          </div>
        </button>

      </section>
    </div>
  );
}
