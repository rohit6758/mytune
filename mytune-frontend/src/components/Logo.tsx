export default function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff9900" /> {/* primary-container */}
          <stop offset="100%" stopColor="#ff5540" /> {/* secondary-container */}
        </linearGradient>
      </defs>
      
      {/* Waveform 'M' Shape based on user description */}
      <path 
        d="M 10 50 L 10 60 C 10 65 15 65 15 60 L 15 45 C 15 40 20 40 20 45 L 20 65 C 20 70 25 70 25 65 L 25 40 C 25 35 30 35 30 40 L 30 55 C 30 65 40 65 45 55 L 50 40 L 55 55 C 60 65 70 65 70 55 L 70 40 C 70 35 75 35 75 40 L 75 65 C 75 70 80 70 80 65 L 80 45 C 80 40 85 40 85 45 L 85 60 C 85 65 90 65 90 60 L 90 50" 
        stroke="url(#logoGrad)" 
        strokeWidth="6" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}
