/* Brand gradient string — equal tangerine + red */
const BRAND_GRAD = 'linear-gradient(135deg, #FF9900 0%, #FF5520 50%, #FF2020 100%)';

export default function Profile() {
  return (
    <div className="inner-scroll h-full overflow-y-auto pb-4">

      {/* ── Profile Header ─────────────────────────────────── */}
      <section
        className="relative flex flex-col items-center text-center pt-10 pb-8 px-4"
        style={{ background: 'radial-gradient(circle at 50% 0%, rgba(255,104,32,0.18) 0%, rgba(0,0,0,0) 70%)' }}
      >
        {/* Avatar */}
        <div className="relative mb-5">
          <div className="absolute inset-0 rounded-full blur-xl opacity-40 animate-pulse" style={{ background: BRAND_GRAD }} />
          <img
            alt="Alex Mercer"
            className="relative z-10 w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full border-2 object-cover shadow-2xl"
            style={{ borderColor: 'rgba(255,104,32,0.5)' }}
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoH5DXWGF9BHtLDzmnUXFQSTELuorBSj58CfLiplu4NpcdjvR_-Y57F6tQ6tuZpf6qc1dapffuzCHlt-6Npq5irb2GUMq5rpjzdxRHhufJbJ1DxwYlNaXU3aMdsH4x0oGqb1Gnhq4fg_n_694pnPoc9F5duHvESTs9CGtSEdp4GyMvcW04kvP50E-uVgWwgPxiTNv2Pe7fov4tRuFgxWdqUN0OfdfOpp9kfsbGsDBVU5AIqnLPq7qzLQ"
          />
          <div
            className="absolute bottom-1 right-1 z-20 rounded-full p-1.5 border-2 border-black flex items-center justify-center shadow-lg"
            style={{ background: BRAND_GRAD }}
          >
            <span className="material-symbols-outlined text-white text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          </div>
        </div>

        {/* Name & bio */}
        <div className="space-y-1 mb-7 z-10">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">ALEX MERCER</h1>
          <p className="text-sm font-medium text-white/60">Electronic &amp; Synthesizer Enthusiast</p>
        </div>

        {/* Stats bar */}
        <div
          className="rounded-2xl w-full max-w-sm mx-auto p-5 mb-7 z-10"
          style={{ background: 'rgba(38, 38, 38, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex justify-around items-center">
            <div className="flex flex-col items-center gap-0.5 cursor-pointer group">
              <span className="text-xl font-black" style={{ background: BRAND_GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>12.4K</span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-white/50 group-hover:text-white/80 transition-colors">Followers</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col items-center gap-0.5 cursor-pointer group">
              <span className="text-xl font-black text-white">482</span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-white/50 group-hover:text-white/80 transition-colors">Following</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col items-center gap-0.5 cursor-pointer group">
              <span className="text-xl font-black text-white">34</span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-white/50 group-hover:text-white/80 transition-colors">Playlists</span>
            </div>
          </div>
        </div>

        {/* Edit Profile button */}
        <button
          className="z-10 font-bold text-sm uppercase tracking-widest px-8 py-3.5 rounded-full flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
          style={{
            background: BRAND_GRAD,
            boxShadow: '0 0 20px rgba(255,104,32,0.35)',
          }}
        >
          <span className="material-symbols-outlined text-white text-base" style={{ fontVariationSettings: "'FILL' 0" }}>edit</span>
          <span className="text-white">Edit Profile</span>
        </button>
      </section>

      {/* ── Body sections ──────────────────────────────────── */}
      <div className="px-4 md:px-8 max-w-3xl mx-auto space-y-10 pb-4">

        {/* Recent Activity */}
        <section className="space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <h2 className="text-base font-black uppercase tracking-widest text-white">Recent Activity</h2>
            <button className="text-xs font-bold uppercase tracking-widest text-[#FF6820] hover:text-[#FF9900] transition-colors">View All</button>
          </div>

          {/* Track rows */}
          {[
            {
              title: 'Neon Circuitry', artist: 'BYTE SHIFT', liked: true,
              img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0l9NtgPMJu8SHnoavyjhKlREsoc_EZ1cdJBHeYFPj3_iTlym48rhscVK8laNhPnjpCXlkqpKyhqSNICCHJeHLE9D7-mSjewCy12ztJNQkH6oOeB6nCB0JZteQouG6EgsNSp4J_EzUBR2ESY4UxxeN5Tgz2mnvxkoAJmj4kLha5FQ7WSYUm5-vPAwHGK2yCJly1z5drMiSK-7SCaqfPZpQxaVD3tj_ctB9gCY6SbnZ_Ww8Q9foGUgCwQ'
            },
            {
              title: 'Velocity Drive', artist: 'KROME', liked: false,
              img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6dQ9YAieREAQboRSsvMAGzzmIa-1IqPGBi77F0rObhWmxO-md6xSsT41uLogpjRJf84mHaxq8iNUhiqykAAVbPLzNx9cE1PROyn1Sh1WwF3Z-DiHL48eOnOw2g1Vp2LVn7m0S9jdc-4rKLyC58vMJRF2YuSvXDAsaEXBOS0rO1hsywtz0hcaP54xijA79wPOsP-xAHBgAdh7V2uma5U4QNsYV4zVwMw3EYgyyRYyomcd7w2S5S2yJFA'
            },
          ].map(track => (
            <div
              key={track.title}
              className="rounded-xl p-3 flex items-center justify-between group hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              style={{ background: 'rgba(38, 38, 38, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="flex items-center gap-4">
                <img alt="Album Art" className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover shadow-md flex-shrink-0" src={track.img} />
                <div>
                  <p className="font-bold text-sm text-white group-hover:text-[#FF8030] transition-colors">{track.title}</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50 mt-0.5">{track.artist}</p>
                </div>
              </div>
              <button className="p-2 rounded-full hover:bg-white/5 transition-colors">
                <span className="material-symbols-outlined text-[#FF3C20] text-xl" style={{ fontVariationSettings: track.liked ? "'FILL' 1" : "'FILL' 0" }}>
                  favorite
                </span>
              </button>
            </div>
          ))}
        </section>

        {/* Public Playlists */}
        <section className="space-y-4">
          <h2 className="text-base font-black uppercase tracking-widest text-white border-b border-white/10 pb-3">Public Playlists</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Playlist 1 */}
            <div className="rounded-2xl overflow-hidden cursor-pointer group flex items-end h-48 sm:h-56 relative shadow-lg">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBtfro2hwOapTOatiqSlwHnkblitbp8Jc-t9LrSQJq_7nLD3RSugNPpeZfVMU1HpoVwMZYF73y0cROOei4A2Fonx7TvmahFgt2kwLtnZhO8dCWkl_ePCkT4IcJp01lj3qftH3dF243vCxVeZ3EkG4KubEuxac2RXdYMzixig-sJxhgQaZBGK1AVUYjMrUbOWLm83TSHRoFRRXnKGzC78uJXsZQeLy_hnfXS-JkkyOLnf8C9g4ctIytOeQ')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90" />
              <div className="absolute top-0 left-0 w-1 h-full" style={{ background: BRAND_GRAD }} />
              <div className="relative z-10 w-full p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="bg-black/50 backdrop-blur-sm text-[#FF8030] text-[11px] font-bold uppercase px-2.5 py-1 rounded-full tracking-wider border border-[#FF8030]/30">Workout</span>
                  <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 transition-all duration-300 text-3xl group-hover:text-[#FF8030]">play_circle</span>
                </div>
                <h3 className="text-base font-black text-white uppercase">Maximum Overdrive</h3>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50 mt-1">42 Tracks · 2h 15m</p>
              </div>
            </div>

            {/* Playlist 2 */}
            <div className="rounded-2xl overflow-hidden cursor-pointer group flex items-end h-48 sm:h-56 relative shadow-lg">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB6GDJr-cam4k1a0uJVmjJqNb78_5d3erWl2ggAG4vA_zeK3JrCkDbK0Xae69Ke-vcUN_HEs1m6JyLdScjMIjzg7VB2Ms1nl2N1_mqWZw4tWa1ZxHh6JsQpyRSX1droaLWfwCqsGN5rCQe2jEddFaIY0uYf_NqcHiz7RF6xXwo7DEzrqOfT9ukM32b2ztubihRkUVbiMA2BB6muxdOCbB6VPmRRAoY3b0uLyWH8-KaEHwbqAHaKoeWsrw')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90" />
              <div className="absolute top-0 left-0 w-1 h-full bg-[#FF3C20]" style={{ boxShadow: '0 0 15px rgba(255,60,32,0.6)' }} />
              <div className="relative z-10 w-full p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="bg-black/50 backdrop-blur-sm text-[#FF3C20] text-[11px] font-bold uppercase px-2.5 py-1 rounded-full tracking-wider border border-[#FF3C20]/30">Focus</span>
                  <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 transition-all duration-300 text-3xl group-hover:text-[#FF3C20]">play_circle</span>
                </div>
                <h3 className="text-base font-black text-white uppercase">Deep Code State</h3>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50 mt-1">18 Tracks · 1h 40m</p>
              </div>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}
