import { Search as SearchIcon } from 'lucide-react';

const CATEGORIES = [
  { name: 'Pop', color: 'from-orange-500 to-red-500' },
  { name: 'Rock', color: 'from-amber-600 to-orange-700' },
  { name: 'Hip-Hop', color: 'from-orange-400 to-red-600' },
  { name: 'Synthwave', color: 'from-red-500 to-orange-600' },
  { name: 'Jazz', color: 'from-amber-700 to-orange-800' },
  { name: 'Electronic', color: 'from-orange-500 to-red-700' },
  { name: 'Indie', color: 'from-red-600 to-orange-500' },
  { name: 'Classical', color: 'from-orange-600 to-amber-700' },
];

export default function Search() {
  return (
    <div className="w-full h-full max-w-4xl mx-auto p-4 md:p-8 flex flex-col gap-8">
      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-textMuted group-focus-within:text-primary transition-colors">
          <SearchIcon size={20} />
        </div>
        <input
          type="text"
          placeholder="Artists, songs, or podcasts"
          className="w-full bg-surface border border-surfaceHover rounded-2xl py-4 pl-12 pr-4 text-textMain placeholder-textMuted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
        />
      </div>

      <div>
        <h2 className="text-3xl font-display font-bold mb-6">Browse All</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((category) => (
            <div
              key={category.name}
              className={`relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer group bg-gradient-to-br ${category.color} hover:scale-[1.02] transition-transform duration-300 shadow-md`}
            >
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300"></div>
              <h3 className="absolute bottom-4 left-4 text-xl font-bold font-display tracking-wide drop-shadow-md">
                {category.name}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
