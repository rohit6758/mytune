import { useState } from 'react';

const CATEGORIES = [
  { name: 'Pop',       bg: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAoyIQ0CUln5wgrpaCOYWI6GsNbBmrOtGXayAqupQ5V5YXjxbJX9CZvnOf_qk-11pM02s7dlpub6PKsGJ38YzkjIHzFpfIX-zAPaIV9xbqPxNnJT4W_mF-SZ3jTExInfFKGMduduXaaR2d4yB7h0srbYrTzij_JJGpz-Y69cCv2iPRvaqqaubHacxfFUSQCu-g0h2W4FHS8tUoGvvch17r3XkcQvA-mQOzDO5mzQvP8QT-watnwdUS6yg')" },
  { name: 'Rock',      bg: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDk0dEpjhZCOa2KkAnD7bca9vmIGUbtVycR5uY4O2D0iBtwbl8JDz-ZzYgkRkOcTXnrta08nAjHDtE9Tfj-8K4RoyloWht_WTLfIU5BHx3-k-N1WOlvC7ZWTY8CYOeWkfbXqAUpDZO1oaECgRdDINlBSDhrJu8QPyvvVhEvZf51uWoV3wJ9ccTChDhqIO3IbXG40fZ0giMaotFj1hVegX6N-1kSOkhciL3uptLJutwujAICoGv3Fj8CRw')" },
  { name: 'Hip-Hop',   bg: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB4yiTfXl19FAiiFNST0cJLez2LvAeVl0cH88NJmlHnOt7Fdu612V--xCCDA--qcDStONpYpOWVwmjHjeWlKNjEXZiqJaoiRe4npTvHRJNoBsgUQ30PwnEdvxxDItQoDaD2cTWpbrYszGdQk-tpOTL9mlJPQ60WNQQxNiQec1HspfW3zgTVGkbrfphT8tpDadSvao65ekVP1qJadpHskx8jMa_plfi0r-mZX1o1tta_jfqedoAbSZ1M1g')" },
  { name: 'Synthwave', bg: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCHvVCMHA7wnVhkA7Q-p_mX_UdryHKyXtLrPj5NwQvuLod9SyI4ybkULMWD0q4u658k0cAIE6Vi17KvBR9X6TxgIgshu_KAwNUiH7Ft6BGcQfVqaZ6eRI2Qaxuib9Lf4AJYDrvUFVbXm0c0JC843-zd4oYaJ_HdfHVcUgQV4BdJYWQ8Qk6Gz6nCM3vJMSJwpbidMTbNTapljxNc34Lte1BCWCl-jKr6fRFwrRVbOhJN2mTQMoygf9LzBw')" },
  { name: 'Jazz',      bg: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB08vYguq-cl4Ma0lp1innp-hurA3feaFxZOFNN6JJqXpdGzlNeHVLHi1XsX-ff3X8p2DNjtlw1VvuT2K9zPIjtEXNFqUDNSlARbiuNAwIoVZ_HS_YS00A72jZRISqBusyDm_buHO4CImWG5AwfX4n9bkC2qtEKWsmNqMqNRuW-g1UkkKVpo_-tJYbNbEiJ4o7d0SA-q1_zxfmKZfmlBUOgUnDE9Qk6J1JiPUxZzoQEsS-toZyvFqFtzg')" },
  { name: 'Electronic',bg: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDhSFgq6WNvhmda5uof7BZgEmvf4iGs1HsJI3mufebVuOwQluciCMvWm4_SODo7CeDMTWZU7iRdGUBGfaAMYNRHQWxyart0RNQ-jkLCZhajZ01O4lned2QNM0c8qQQ24s6LSCL2ar9qhE8cw7ypqCZsatwTsZF0hj3DYVWV3D6ZdJSlHZJ4BrAv1fMQYv5W5f-agQl7atxm_SCON1iNyDTejltuqtv5TkHWeVkbn1GyViaNUqIyY6H7Pg')" },
  { name: 'Indie',     bg: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA47AU8ykQkMtDslv2lCcd-r-saOzn89jj4d3aMO3EcGir9y14ZR4yty1STVIbUk66qCS3PMLLvjqo8m1o8l8lsSXwYCiZ6r-kBtAR3lgyT62EKKm2vtYP1aE2xV_WYQAS0VGyHuG_pJ_wwbRtzkf94bdqcjQiF0Hwhga2rp2w7B50EjNldqK1UwUXDr9cf2GcsTDVHAxr_lDORijT5lF_kMT0-fetCfGKi0b2qbldSvonE4wbhZ-SGvw')" },
  { name: 'Classical', bg: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCrNYdcDVktwhVhOiWXoPGvs5DgNTjpPopO1OSXdP9HoAW9kYafC-2YXy5EIujZkFGFXlwzTdASsQ6XSBqGwgOO1HNMVFzSBRQKsvPXsU-wtTILwlra960EX2VWGdIjL8cIpMvD_4ZCvlRa6r21KEVCmX1gOqetWamcW2XFYJN31MqhOh6hs5pprrOihpxTBEIA_auSSH1R5bf7TAceLJl1WGoxTBqpc0E6xTgQIW7hSX_LAzcXOhuAQg')" },
];

export default function Search() {
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? CATEGORIES.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
    : CATEGORIES;

  return (
    <div className="inner-scroll h-full overflow-y-auto px-4 pt-4 pb-4 w-full max-w-2xl mx-auto flex flex-col gap-5">

      {/* Search Bar */}
      <div className="sticky top-0 pt-2 pb-2 bg-black z-40">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-xl" style={{ fontVariationSettings: "'FILL' 0" }}>
            search
          </span>
          <input
            className="w-full bg-[#1A1A1A] border border-[#1A1A1A] rounded-full py-4 pl-12 pr-4 text-base text-white placeholder-white/40 transition-all duration-200 focus:border-[#FF6820] focus:outline-none focus:ring-2 focus:ring-[#FF6820]/30"
            placeholder="Artists, songs, or podcasts"
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Categories Grid */}
      <section>
        <h2 className="text-2xl font-extrabold mb-5 text-white">Browse All</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filtered.map(category => (
            <div
              key={category.name}
              className="relative overflow-hidden rounded-xl aspect-[3/2] flex flex-col justify-end p-4 cursor-pointer transform hover:scale-[1.02] active:scale-95 transition-transform duration-200 group bg-cover bg-center"
              style={{ backgroundImage: category.bg }}
            >
              {/* Gradient overlay — equal tangerine + red */}
              <div
                className="absolute inset-0 opacity-75 group-hover:opacity-90 transition-opacity duration-300"
                style={{ background: 'linear-gradient(135deg, rgba(255,153,0,0.7) 0%, rgba(255,85,32,0.7) 50%, rgba(255,21,21,0.7) 100%)' }}
              />
              <span className="relative z-10 text-lg font-bold text-white drop-shadow-lg">
                {category.name}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
