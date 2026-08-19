import React from 'react';

const MENU_ITEMS = [
  { icon: 'play_arrow', label: 'Player and audio' },
  { icon: 'account_circle', label: 'Account' },
  { icon: 'groups', label: 'Listen Together' },
  { icon: 'language', label: 'Content' },
  { icon: 'translate', label: 'AI Lyrics Translation' },
  { icon: 'security', label: 'Privacy' },
  { icon: 'storage', label: 'Storage' },
  { icon: 'cloud_upload', label: 'Backup and restore' },
  { icon: 'info', label: 'About' },
];

export default function Settings() {
  return (
    <div className="h-full w-full bg-[#111115] text-white flex flex-col inner-scroll">
      {/* Top Bar */}
      <div className="flex items-center gap-4 p-4 border-b border-white/5">
        <button onClick={() => window.history.back()} className="p-2 text-white/70 hover:text-white">
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      {/* Menu List */}
      <div className="flex flex-col p-4 gap-3">
        {MENU_ITEMS.map((item, i) => (
          <button 
            key={i} 
            className="flex items-center gap-4 bg-[#1e1c24] p-4 rounded-2xl hover:bg-[#2a2833] transition-colors active:scale-95"
            onClick={() => {
              if (item.label === 'Listen Together') {
                 window.location.href = '/together';
              }
            }}
          >
            <div className="w-10 h-10 rounded-full bg-[#8ab4f8]/10 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[#8ab4f8]">{item.icon}</span>
            </div>
            <span className="font-semibold text-[15px]">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
