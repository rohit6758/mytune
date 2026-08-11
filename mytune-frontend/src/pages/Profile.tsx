import { Edit2, Heart } from 'lucide-react';

const RECENT_ACTIVITY = [
  { id: 1, title: 'Neon Circuitry', artist: 'BYTE SHIFT' },
  { id: 2, title: 'Velocity Drive', artist: 'KROME' },
];

const PLAYLISTS = [
  { id: 1, name: 'MAXIMUM OVERDRIVE', label: 'WORKOUT', tracks: 42, time: '2H 15M' },
  { id: 2, name: 'DEEP CODE STATE', label: 'FOCUS', tracks: 18, time: '1H 40M' },
];

export default function Profile() {
  return (
    <div className="w-full h-full max-w-3xl mx-auto p-4 md:p-8 flex flex-col gap-10">
      {/* Profile Header */}
      <div className="flex flex-col items-center mt-4">
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-4 border-surface overflow-hidden bg-surfaceHover shadow-2xl shadow-primary/20">
            {/* Avatar placeholder */}
            <div className="w-full h-full bg-gradient-to-tr from-surface to-surfaceHover flex items-center justify-center">
              <span className="text-5xl text-primary font-display font-bold">A</span>
            </div>
          </div>
          {/* Pro Badge */}
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full border-2 border-background flex items-center justify-center shadow-lg">
            <span className="text-background font-bold text-xs">PRO</span>
          </div>
        </div>
        
        <h1 className="mt-6 text-4xl font-display font-bold tracking-tight">ALEX MERCER</h1>
        <p className="text-textMuted mt-2 text-lg">Electronic & Synthesizer Enthusiast</p>
        
        {/* Stats */}
        <div className="flex bg-surface rounded-2xl mt-8 py-4 px-8 shadow-lg border border-surfaceHover">
          <div className="flex flex-col items-center px-6">
            <span className="text-2xl font-bold text-primary font-display">12.4K</span>
            <span className="text-xs tracking-widest text-textMuted uppercase mt-1">Followers</span>
          </div>
          <div className="w-px bg-surfaceHover self-stretch mx-2"></div>
          <div className="flex flex-col items-center px-6">
            <span className="text-2xl font-bold text-textMain font-display">482</span>
            <span className="text-xs tracking-widest text-textMuted uppercase mt-1">Following</span>
          </div>
          <div className="w-px bg-surfaceHover self-stretch mx-2"></div>
          <div className="flex flex-col items-center px-6">
            <span className="text-2xl font-bold text-textMain font-display">34</span>
            <span className="text-xs tracking-widest text-textMuted uppercase mt-1">Playlists</span>
          </div>
        </div>

        <button className="mt-8 flex items-center gap-2 bg-primary hover:bg-primaryHover text-background font-bold py-3 px-8 rounded-full transition-colors shadow-lg shadow-primary/25">
          <Edit2 size={18} />
          EDIT PROFILE
        </button>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-2xl font-display font-bold">RECENT ACTIVITY</h2>
          <button className="text-primary text-sm font-semibold hover:underline uppercase tracking-wide">View All</button>
        </div>
        <div className="flex flex-col gap-3">
          {RECENT_ACTIVITY.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-4 bg-surface rounded-xl border border-transparent hover:border-surfaceHover transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-surfaceHover rounded-lg flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-orange-600/40 to-transparent"></div>
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{activity.title}</h3>
                  <p className="text-sm text-textMuted uppercase tracking-wider">{activity.artist}</p>
                </div>
              </div>
              <button className="text-textMuted hover:text-primary transition-colors p-2">
                <Heart size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Public Playlists */}
      <div className="pb-8">
        <h2 className="text-2xl font-display font-bold mb-4 uppercase">Public Playlists</h2>
        <div className="flex flex-col gap-6">
          {PLAYLISTS.map((playlist) => (
            <div key={playlist.id} className="relative aspect-[21/9] sm:aspect-[3/1] bg-surfaceHover rounded-2xl overflow-hidden group cursor-pointer shadow-lg border border-surfaceHover hover:border-primary/50 transition-colors">
               <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent z-10"></div>
               {/* Content */}
               <div className="absolute inset-0 z-20 flex flex-col justify-end p-6">
                  <span className="self-start text-[10px] uppercase tracking-widest font-bold text-primary border border-primary/30 bg-primary/10 px-3 py-1 rounded-full mb-3 backdrop-blur-md">
                    {playlist.label}
                  </span>
                  <h3 className="text-3xl font-display font-black tracking-tight text-white mb-1 group-hover:text-primary transition-colors">{playlist.name}</h3>
                  <p className="text-sm text-textMuted font-medium uppercase tracking-wider">
                    {playlist.tracks} Tracks • {playlist.time}
                  </p>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
