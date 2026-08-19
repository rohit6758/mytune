import React from 'react';

export default function Together() {
  return (
    <div className="h-full w-full bg-[#111115] text-white flex flex-col inner-scroll">
      {/* Top Bar */}
      <div className="flex items-center gap-4 p-4 border-b border-white/5">
        <button onClick={() => window.history.back()} className="p-2 text-white/70 hover:text-white">
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold">Together</h1>
      </div>

      <div className="p-6 flex flex-col gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-[#354f88] flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-white text-3xl">groups</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">Listen Together</h2>
            <p className="text-white/60 text-sm leading-relaxed">
              Listen to music with your friends in real-time. Create a room to be the host or join an existing room with a code.
            </p>
          </div>
        </div>

        {/* Connect Box */}
        <div className="bg-[#1e1c24] rounded-3xl p-6 flex flex-col items-center gap-4 border border-white/5 mt-4">
          <div className="flex items-center gap-2 text-white/50 text-sm font-semibold">
            <span className="w-2 h-2 rounded-full bg-white/30" />
            Disconnected
          </div>
          <button className="w-full py-4 rounded-full bg-[#8ab4f8] text-black font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <span className="material-symbols-outlined">link</span>
            Connect
          </button>
        </div>

        {/* Inputs */}
        <div className="bg-[#1e1c24] rounded-3xl p-4 flex flex-col gap-2 border border-white/5">
          <div className="flex items-center gap-4 px-2 py-3">
            <span className="material-symbols-outlined text-[#8ab4f8]">person</span>
            <input type="text" placeholder="Username" className="bg-transparent outline-none flex-1 font-semibold text-white placeholder-white/40" />
          </div>
          <div className="h-[1px] w-full bg-white/10" />
          <div className="flex items-center gap-4 px-2 py-3">
            <span className="material-symbols-outlined text-[#8ab4f8]">groups</span>
            <input type="text" placeholder="Room code" className="bg-transparent outline-none flex-1 font-semibold text-white placeholder-white/40" />
          </div>
        </div>

        {/* Settings */}
        <div className="bg-[#1e1c24] rounded-3xl p-4 flex items-center justify-between border border-white/5 cursor-pointer active:scale-95 transition-transform">
          <div className="flex items-center gap-4 px-2">
            <span className="material-symbols-outlined text-white/70">settings</span>
            <div>
              <h3 className="font-bold text-white text-sm">Settings</h3>
              <p className="text-white/50 text-xs">Configure server, username, and more</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-white/50">arrow_forward</span>
        </div>
      </div>
    </div>
  );
}
