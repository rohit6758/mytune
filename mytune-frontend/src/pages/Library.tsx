const RECENT = [
  {
    id: 1, title: 'Neon Circuitry', type: 'Single · Byte Shift',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtfro2hwOapTOatiqSlwHnkblitbp8Jc-t9LrSQJq_7nLD3RSugNPpeZfVMU1HpoVwMZYF73y0cROOei4A2Fonx7TvmahFgt2kwLtnZhO8dCWkl_ePCkT4IcJp01lj3qftH3dF243vCxVeZ3EkG4KubEuxac2RXdYMzixig-sJxhgQaZBGK1AVUYjMrUbOWLm83TSHRoFRRXnKGzC78uJXsZQeLy_hnfXS-JkkyOLnf8C9g4ctIytOeQ',
  },
  {
    id: 2, title: 'Midnight City Flows', type: 'Playlist · 24 tracks',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7oSNvUX4pO6L9PHAtlaax3oRUPhu2BIH09LXaw--8N2qYSD4NqMJweU9UqsR8qd3Ig4q5ufgyAwJR0_SHqsAiSdHoPy3j1P9jJs0gD48BSt-mQm8rTjupFxK5tGVJ6arByk50bfPoyr8xE6KcX50OB8IFGyRmja2fzA7voabuzbm9HuoK6CzjJ1B2prSOUoEod1dCHhvhuo5XM0GpiXF0lEPX7Yd_evq3y1u4y34A0vApQDGMetZxFg',
  },
  {
    id: 3, title: 'Neon Rush', type: 'Album · Byte Shift',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0l9NtgPMJu8SHnoavyjhKlREsoc_EZ1cdJBHeYFPj3_iTlym48rhscVK8laNhPnjpCXlkqpKyhqSNICCHJeHLE9D7-mSjewCy12ztJNQkH6oOeB6nCB0JZteQouG6EgsNSp4J_EzUBR2ESY4UxxeN5Tgz2mnvxkoAJmj4kLha5FQ7WSYUm5-vPAwHGK2yCJly1z5drMiSK-7SCaqfPZpQxaVD3tj_ctB9gCY6SbnZ_Ww8Q9foGUgCwQ',
  },
  {
    id: 4, title: 'Velocity Drive EP', type: 'EP · Krome',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6dQ9YAieREAQboRSsvMAGzzmIa-1IqPGBi77F0rObhWmxO-md6xSsT41uLogpjRJf84mHaxq8iNUhiqykAAVbPLzNx9cE1PROyn1Sh1WwF3Z-DiHL48eOnOw2g1Vp2LVn7m0S9jdc-4rKLyC58vMJRF2YuSvXDAsaEXBOS0rO1hsywtz0hcaP54xijA79wPOsP-xAHBgAdh7V2uma5U4QNsYV4zVwMw3EYgyyRYyomcd7w2S5S2yJFA',
  },
];

const LIKED_TRACKS = [
  { id: 1, title: 'Midnight City Flows', artist: 'The Neon Synthetics', duration: '0:30', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7oSNvUX4pO6L9PHAtlaax3oRUPhu2BIH09LXaw--8N2qYSD4NqMJweU9UqsR8qd3Ig4q5ufgyAwJR0_SHqsAiSdHoPy3j1P9jJs0gD48BSt-mQm8rTjupFxK5tGVJ6arByk50bfPoyr8xE6KcX50OB8IFGyRmja2fzA7voabuzbm9HuoK6CzjJ1B2prSOUoEod1dCHhvhuo5XM0GpiXF0lEPX7Yd_evq3y1u4y34A0vApQDGMetZxFg' },
  { id: 2, title: 'Neon Circuitry', artist: 'Byte Shift', duration: '0:28', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtfro2hwOapTOatiqSlwHnkblitbp8Jc-t9LrSQJq_7nLD3RSugNPpeZfVMU1HpoVwMZYF73y0cROOei4A2Fonx7TvmahFgt2kwLtnZhO8dCWkl_ePCkT4IcJp01lj3qftH3dF243vCxVeZ3EkG4KubEuxac2RXdYMzixig-sJxhgQaZBGK1AVUYjMrUbOWLm83TSHRoFRRXnKGzC78uJXsZQeLy_hnfXS-JkkyOLnf8C9g4ctIytOeQ' },
  { id: 3, title: 'Velocity Drive', artist: 'Krome', duration: '0:30', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6GDJr-cam4k1a0uJVmjJqNb78_5d3erWl2ggAG4vA_zeK3JrCkDbK0Xae69Ke-vcUN_HEs1m6JyLdScjMIjzg7VB2Ms1nl2N1_mqWZw4tWa1ZxHh6JsQpyRSX1droaLWfwCqsGN5rCQe2jEddFaIY0uYf_NqcHiz7RF6xXwo7DEzrqOfT9ukM32b2ztubihRkUVbiMA2BB6muxdOCbB6VPmRRAoY3b0uLyWH8-KaEHwbqAHaKoeWsrw' },
];

const BRAND_GRAD = 'linear-gradient(135deg, #F5E642 0%, #FF9900 100%)';

export default function Library() {
  return (
    <div className="inner-scroll h-full overflow-y-auto pb-6" style={{ paddingBottom: '120px' }}>

      {/* Header */}
      <div className="px-4 pt-6 pb-4 flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">Your Library</h1>
        <button className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
          <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 0" }}>add</span>
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 px-4 mb-5 overflow-x-auto pb-1 no-scrollbar">
        {['Playlists', 'Albums', 'Artists', 'Podcasts'].map((f, i) => (
          <button
            key={f}
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors"
            style={i === 0 ? { background: BRAND_GRAD, color: '#000' } : { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Liked Songs special card */}
      <div className="px-4 mb-4">
        <div
          className="flex items-center gap-4 p-4 rounded-xl cursor-pointer hover:bg-white/5 transition-colors active:scale-[0.98]"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: BRAND_GRAD }}>
            <span className="material-symbols-outlined text-black text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-white text-sm truncate">Liked Songs</p>
            <p className="text-xs text-white/50 mt-0.5">Playlist · 3 tracks</p>
          </div>
          <span className="material-symbols-outlined text-white/30 ml-auto" style={{ fontVariationSettings: "'FILL' 0" }}>chevron_right</span>
        </div>
      </div>

      {/* Recently Played */}
      <div className="px-4 mb-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Recently Played</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {RECENT.map(item => (
            <button
              key={item.id}
              className="group relative flex flex-col gap-2 p-2 rounded-xl cursor-pointer hover:bg-white/5 transition-all active:scale-95 text-left"
            >
              <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-lg">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 flex items-end justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-xl translate-y-2 group-hover:translate-y-0 transition-transform duration-200" style={{ background: BRAND_GRAD }}>
                    <span className="material-symbols-outlined text-black text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                  </div>
                </div>
              </div>
              <div className="px-1">
                <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                <p className="text-xs text-white/45 truncate mt-0.5">{item.type}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Liked Tracks list */}
      <div className="px-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Liked Tracks</h2>
        <div className="flex flex-col gap-1">
          {LIKED_TRACKS.map((track, idx) => (
            <div
              key={track.id}
              className="group flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/5 transition-colors active:scale-[0.99]"
            >
              <span className="text-white/30 text-sm font-mono w-4 text-center group-hover:hidden">{idx + 1}</span>
              <span className="material-symbols-outlined text-[#F5E642] text-lg hidden group-hover:block" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
              <img src={track.img} alt={track.title} className="w-11 h-11 rounded-md object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{track.title}</p>
                <p className="text-xs text-white/45 truncate">{track.artist}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/30 font-mono">{track.duration}</span>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-white/10">
                  <span className="material-symbols-outlined text-white/60 text-lg" style={{ fontVariationSettings: "'FILL' 0" }}>more_horiz</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
