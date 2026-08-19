import React, { useState, useEffect } from 'react';

export default function PermissionsModal({ onComplete }: { onComplete: () => void }) {
  const [notificationsGranted, setNotificationsGranted] = useState(false);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationsGranted(true);
    }
  }, []);

  const requestNotifications = async () => {
    if (!('Notification' in window)) {
      alert("This browser does not support desktop notification");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationsGranted(true);
    }
  };

  const requestInstall = () => {
    alert("To install, use your browser's 'Add to Home Screen' or Install prompt if available.");
  };

  return (
    <div className="fixed inset-0 z-[500] flex flex-col bg-[#0f0e13] text-white p-6 justify-between">
      <div className="pt-12">
        <h1 className="text-4xl font-bold mb-4 italic text-white/90 leading-tight">
          Required<br />
          <span className="text-[#8ab4f8]">Permissions</span>
        </h1>
        <p className="text-white/70 mb-10 text-sm leading-relaxed">
          These permissions are required for MyTune to function correctly. Please grant them to proceed.
        </p>

        <div className="flex flex-col gap-4">
          {/* Notifications */}
          <div className="bg-[#1f1e24] p-4 rounded-2xl flex gap-4 items-start">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#ff8a9f' }}>
              <span className="material-symbols-outlined text-black" style={{ fontVariationSettings: "'FILL' 1" }}>notifications</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white mb-1">Notifications</h3>
              <p className="text-white/50 text-xs">Know immediately when your music is playing and control it from the notification bar.</p>
            </div>
            <button 
              onClick={requestNotifications}
              className={`w-12 h-7 rounded-full flex items-center transition-colors px-1 ${notificationsGranted ? 'bg-[#8ab4f8]' : 'bg-white/20'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${notificationsGranted ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* App Installation */}
          <div className="bg-[#1f1e24] p-4 rounded-2xl flex gap-4 items-start cursor-pointer active:scale-95 transition-transform" onClick={requestInstall}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#ffb270' }}>
              <span className="material-symbols-outlined text-black" style={{ fontVariationSettings: "'FILL' 1" }}>system_update</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white mb-1">App Installation</h3>
              <p className="text-white/50 text-xs">Required to download and install app updates seamlessly.</p>
            </div>
            <span className="material-symbols-outlined text-white/50 self-center">chevron_right</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between gap-4 pb-6">
        <button onClick={onComplete} className="flex-1 py-4 rounded-full border border-white/20 font-bold text-white/70">
          Back
        </button>
        <button onClick={onComplete} className="flex-1 py-4 rounded-full bg-[#8ab4f8] text-black font-bold">
          Next
        </button>
      </div>
    </div>
  );
}
