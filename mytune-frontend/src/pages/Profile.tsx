export default function Profile() {
  return (
    <div className="pb-8">
      {/* Profile Header */}
      <section className="relative flex flex-col items-center text-center pt-12 pb-8 px-margin-mobile" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(255, 153, 0, 0.15) 0%, rgba(0,0,0,0) 70%)' }}>
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
          <img 
            alt="Alex Mercer" 
            className="relative z-10 w-32 h-32 md:w-48 md:h-48 rounded-full border-2 border-primary/50 object-cover shadow-2xl" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoH5DXWGF9BHtLDzmnUXFQSTELuorBSj58CfLiplu4NpcdjvR_-Y57F6tQ6tuZpf6qc1dapffuzCHlt-6Npq5irb2GUMq5rpjzdxRHhufJbJ1DxwYlNaXU3aMdsH4x0oGqb1Gnhq4fg_n_694pnPoc9F5duHvESTs9CGtSEdp4GyMvcW04kvP50E-uVgWwgPxiTNv2Pe7fov4tRuFgxWdqUN0OfdfOpp9kfsbGsDBVU5AIqnLPq7qzLQ"
          />
          <div className="absolute bottom-2 right-2 z-20 bg-secondary-container rounded-full p-2 border-2 border-black flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          </div>
        </div>
        
        <div className="space-y-1 mb-8 z-10">
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background tracking-tight">
            ALEX MERCER
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant font-medium">
            Electronic & Synthesizer Enthusiast
          </p>
        </div>
        
        <div className="rounded-2xl w-full max-w-md mx-auto p-6 mb-8 z-10" style={{ background: 'rgba(42, 42, 42, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div className="flex justify-around items-center">
            <div className="flex flex-col items-center group cursor-pointer">
              <span className="font-headline-md text-headline-md text-primary drop-shadow-md">12.4K</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase mt-1 tracking-widest group-hover:text-primary transition-colors">Followers</span>
            </div>
            <div className="w-px h-10 bg-surface-container-highest"></div>
            <div className="flex flex-col items-center group cursor-pointer">
              <span className="font-headline-md text-headline-md text-on-background drop-shadow-md">482</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase mt-1 tracking-widest group-hover:text-on-background transition-colors">Following</span>
            </div>
            <div className="w-px h-10 bg-surface-container-highest"></div>
            <div className="flex flex-col items-center group cursor-pointer">
              <span className="font-headline-md text-headline-md text-on-background drop-shadow-md">34</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase mt-1 tracking-widest group-hover:text-on-background transition-colors">Playlists</span>
            </div>
          </div>
        </div>
        
        <button className="z-10 bg-primary-container text-on-primary-container font-label-bold text-label-bold uppercase px-8 py-4 rounded-full shadow-[0_0_20px_rgba(255,153,0,0.3)] hover:shadow-[0_0_30px_rgba(255,153,0,0.5)] hover:-translate-y-1 transition-all duration-300 flex items-center space-x-2">
          <span className="material-symbols-outlined text-lg">edit</span>
          <span>Edit Profile</span>
        </button>
      </section>

      <div className="px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto space-y-12">
        {/* Recently Liked Tracks */}
        <section className="space-y-6">
          <div className="flex justify-between items-end border-b border-surface-container pb-4">
            <h2 className="font-headline-md text-headline-md text-on-background uppercase tracking-tight">Recent Activity</h2>
            <button className="font-label-bold text-label-bold text-primary hover:text-primary-fixed uppercase tracking-wider transition-colors">View All</button>
          </div>
          <div className="grid gap-4">
            {/* Track 1 */}
            <div className="rounded-xl p-3 flex items-center justify-between hover:bg-surface-container-highest transition-all duration-300 group hover:-translate-y-1" style={{ background: 'rgba(42, 42, 42, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div className="flex items-center space-x-4">
                <img alt="Album Art" className="w-14 h-14 rounded-md object-cover shadow-md" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0l9NtgPMJu8SHnoavyjhKlREsoc_EZ1cdJBHeYFPj3_iTlym48rhscVK8laNhPnjpCXlkqpKyhqSNICCHJeHLE9D7-mSjewCy12ztJNQkH6oOeB6nCB0JZteQouG6EgsNSp4J_EzUBR2ESY4UxxeN5Tgz2mnvxkoAJmj4kLha5FQ7WSYUm5-vPAwHGK2yCJly1z5drMiSK-7SCaqfPZpQxaVD3tj_ctB9gCY6SbnZ_Ww8Q9foGUgCwQ" />
                <div>
                  <p className="font-body-md text-body-md text-on-background font-bold group-hover:text-primary transition-colors">Neon Circuitry</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mt-1 tracking-wider">Byte Shift</p>
                </div>
              </div>
              <button className="text-secondary-container p-2 hover:bg-secondary-container/10 rounded-full transition-all duration-300">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
              </button>
            </div>
            {/* Track 2 */}
            <div className="rounded-xl p-3 flex items-center justify-between hover:bg-surface-container-highest transition-all duration-300 group hover:-translate-y-1" style={{ background: 'rgba(42, 42, 42, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div className="flex items-center space-x-4">
                <img alt="Album Art" className="w-14 h-14 rounded-md object-cover shadow-md" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6dQ9YAieREAQboRSsvMAGzzmIa-1IqPGBi77F0rObhWmxO-md6xSsT41uLogpjRJf84mHaxq8iNUhiqykAAVbPLzNx9cE1PROyn1Sh1WwF3Z-DiHL48eOnOw2g1Vp2LVn7m0S9jdc-4rKLyC58vMJRF2YuSvXDAsaEXBOS0rO1hsywtz0hcaP54xijA79wPOsP-xAHBgAdh7V2uma5U4QNsYV4zVwMw3EYgyyRYyomcd7w2S5S2yJFA" />
                <div>
                  <p className="font-body-md text-body-md text-on-background font-bold group-hover:text-primary transition-colors">Velocity Drive</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mt-1 tracking-wider">Krome</p>
                </div>
              </div>
              <button className="text-secondary-container p-2 hover:bg-secondary-container/10 rounded-full transition-all duration-300">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>favorite</span>
              </button>
            </div>
          </div>
        </section>

        {/* Public Playlists */}
        <section className="space-y-6">
          <h2 className="font-headline-md text-headline-md text-on-background uppercase tracking-tight border-b border-surface-container pb-4">Public Playlists</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Playlist 1 */}
            <div className="rounded-2xl overflow-hidden cursor-pointer group flex items-end h-56 relative shadow-lg">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBtfro2hwOapTOatiqSlwHnkblitbp8Jc-t9LrSQJq_7nLD3RSugNPpeZfVMU1HpoVwMZYF73y0cROOei4A2Fonx7TvmahFgt2kwLtnZhO8dCWkl_ePCkT4IcJp01lj3qftH3dF243vCxVeZ3EkG4KubEuxac2RXdYMzixig-sJxhgQaZBGK1AVUYjMrUbOWLm83TSHRoFRRXnKGzC78uJXsZQeLy_hnfXS-JkkyOLnf8C9g4ctIytOeQ')" }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90"></div>
              <div className="absolute top-0 left-0 w-1 h-full bg-primary shadow-[0_0_15px_rgba(255,153,0,0.6)]"></div>
              <div className="relative z-10 w-full p-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="bg-black/50 backdrop-blur-sm text-primary font-label-bold text-xs uppercase px-3 py-1.5 rounded-full tracking-wider border border-primary/30">Workout</span>
                  <span className="material-symbols-outlined text-white opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:text-primary transition-all duration-300 text-4xl">play_circle</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-background uppercase drop-shadow-md">Maximum Overdrive</h3>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mt-2 tracking-wider">42 Tracks • 2h 15m</p>
              </div>
            </div>
            {/* Playlist 2 */}
            <div className="rounded-2xl overflow-hidden cursor-pointer group flex items-end h-56 relative shadow-lg">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB6GDJr-cam4k1a0uJVmjJqNb78_5d3erWl2ggAG4vA_zeK3JrCkDbK0Xae69Ke-vcUN_HEs1m6JyLdScjMIjzg7VB2Ms1nl2N1_mqWZw4tWa1ZxHh6JsQpyRSX1droaLWfwCqsGN5rCQe2jEddFaIY0uYf_NqcHiz7RF6xXwo7DEzrqOfT9ukM32b2ztubihRkUVbiMA2BB6muxdOCbB6VPmRRAoY3b0uLyWH8-KaEHwbqAHaKoeWsrw')" }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90"></div>
              <div className="absolute top-0 left-0 w-1 h-full bg-secondary-container shadow-[0_0_15px_rgba(255,85,64,0.6)]"></div>
              <div className="relative z-10 w-full p-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="bg-black/50 backdrop-blur-sm text-secondary-container font-label-bold text-xs uppercase px-3 py-1.5 rounded-full tracking-wider border border-secondary-container/30">Focus</span>
                  <span className="material-symbols-outlined text-white opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:text-secondary-container transition-all duration-300 text-4xl">play_circle</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-background uppercase drop-shadow-md">Deep Code State</h3>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mt-2 tracking-wider">18 Tracks • 1h 40m</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
