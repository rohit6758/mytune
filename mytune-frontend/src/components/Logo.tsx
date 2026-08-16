export default function Logo({ className = "w-10 h-10", showText = false }: { className?: string; showText?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img src="/logo.png" alt="MyTune Logo" className="h-full w-auto object-contain rounded-xl" />
      {showText && (
        <span className="font-['Montserrat',sans-serif] font-bold text-2xl text-white tracking-tight">
          mytune
        </span>
      )}
    </div>
  );
}
