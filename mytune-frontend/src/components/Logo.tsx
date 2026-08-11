// Logo SVG matching the provided MyTune brand image:
// M-shaped soundwave with bars on both sides, equal tangerine-to-red gradient
export default function Logo({ className = "w-10 h-10", showText = false }: { className?: string; showText?: boolean }) {
  return (
    <svg
      viewBox="0 0 200 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Equal tangerine + red gradient as requested */}
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#FF9900" />
          <stop offset="35%"  stopColor="#FF6020" />
          <stop offset="65%"  stopColor="#FF3520" />
          <stop offset="100%" stopColor="#FF1515" />
        </linearGradient>
      </defs>

      {/* Left short bar */}
      <rect x="4" y="22" width="7" height="26" rx="3.5" fill="url(#logoGrad)" />

      {/* Left tall bar */}
      <rect x="16" y="10" width="7" height="50" rx="3.5" fill="url(#logoGrad)" />

      {/* M shape — soundwave waveform */}
      <path
        d="M28 52 L28 18 Q28 14 32 14 Q36 14 36 18 L36 38 Q36 44 40 44 Q44 44 44 38 L44 24 Q44 18 48 18 L52 18 Q56 18 56 24 L56 38 Q56 44 60 44 Q64 44 64 38 L64 18 Q64 14 68 14 Q72 14 72 18 L72 52"
        stroke="url(#logoGrad)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Right tall bar */}
      <rect x="79" y="10" width="7" height="50" rx="3.5" fill="url(#logoGrad)" />

      {/* Right short bar */}
      <rect x="91" y="22" width="7" height="26" rx="3.5" fill="url(#logoGrad)" />

      {/* "mytune" text — shown when showText=true */}
      {showText && (
        <text
          x="108"
          y="44"
          fontFamily="Montserrat, sans-serif"
          fontWeight="700"
          fontSize="28"
          fill="white"
          opacity="0.9"
          letterSpacing="-0.5"
        >
          mytune
        </text>
      )}
    </svg>
  );
}
