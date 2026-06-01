import { Check } from 'lucide-react';

interface LogoProps {
  isScrolled?: boolean;
  logoStyle?: 'option1' | 'option2' | 'option3';
}

// Option 1 Emblem Component
// - 'P' shaped as a broom handle with a sweeper and 2 sparkles in the loop
// - 'T' shaped as a squeegee with a spray bottle handle
function Option1Icon({ isScrolled }: { isScrolled: boolean }) {
  const colorClass = isScrolled ? 'text-[#1B4332]' : 'text-white';
  
  return (
    <svg 
      viewBox="0 0 44 26" 
      className={`w-11 h-8 transition-colors duration-300 ${colorClass}`}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* P - Broom handle and base */}
      <rect x="5.5" y="1" width="1.8" height="15.5" rx="0.5" fill="currentColor" />
      <path d="M3.5 16.5h5.8l1.7 5.5c0.1 0.4-0.2 0.8-0.6 0.8H2.4c-0.4 0-0.7-0.4-0.6-0.8l1.7-5.5z" fill="currentColor" />
      <path d="M3.2 21.5h5.1m-4.2-3.5v3.5m1.7-3.5v3.5m1.6-3.5v3.5" stroke={isScrolled ? '#95C4A1' : '#1B4332'} strokeWidth="0.5" strokeLinecap="round" opacity="0.6" />

      {/* P - Loop */}
      <path d="M7 2.5h5.5c2.5 0 4.5 1.8 4.5 4.25s-2 4.25-4.5 4.25H7V2.5z M7 4.3v4.9h5.5c1.2 0 2.2-0.9 2.2-2.45s-1-2.45-2.2-2.45H7z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />

      {/* Sparks inside loop of P */}
      <path d="M12 5.5l0.3 0.8 0.8 0.3-0.8 0.3-0.3 0.8-0.3-0.8-0.8-0.3 0.8-0.3z" fill={isScrolled ? '#2D6A4F' : '#B7E4C7'} />
      <path d="M14.2 8l0.25 0.55 0.55 0.25-0.55 0.25-0.25 0.55-0.25-0.55-0.55-0.25 0.55-0.25z" fill={isScrolled ? '#95C4A1' : '#B7E4C7'} />

      {/* T - Window squeegee bar (top) */}
      <rect x="23" y="4" width="16" height="1.5" rx="0.4" fill="currentColor" />
      <rect x="25" y="3" width="12" height="1.0" rx="0.2" fill="currentColor" opacity="0.9" />
      <path d="M29 5.5l0.8 1.4h4.4l0.8-1.4z" fill="currentColor" />

      {/* T - Squeegee Handle as Spray Bottle trunk */}
      <rect x="30.2" y="9" width="1.6" height="1.2" fill="currentColor" />
      <path d="M28.8 8.4c0-.3.2-.5.5-.5h4.2l.2.8-1 1h-3.4l-.5-1.3z" fill="currentColor" />
      <path d="M29.5 9.2l-0.8 1.6c-.1.2.0.4.2.4h0.4c.1 0 .2-.1.2-.2l0.6-1.4z" fill="currentColor" />
      <rect x="29.2" y="10.2" width="3.6" height="11.5" rx="0.8" fill="currentColor" />
      <rect x="28.4" y="11.5" width="1" height="5" rx="0.4" fill={isScrolled ? '#95C4A1' : '#1B4332'} opacity="0.3" />
    </svg>
  );
}

// Option 3 Emblem Component (The Balanced Default)
// - 'P' shaped as a broom handle with a sweeper and a spray bottle inside the loop
// - 'T' shaped as a squeegee with stars floating above the top-right
function Option3Icon({ isScrolled }: { isScrolled: boolean }) {
  const colorClass = isScrolled ? 'text-[#1B4332]' : 'text-white';

  return (
    <svg 
      viewBox="0 0 44 26" 
      className={`w-11 h-8 transition-colors duration-300 ${colorClass}`}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* P - Broom handle and base */}
      <rect x="5.5" y="1.5" width="1.8" height="15" rx="0.5" fill="currentColor" />
      <path d="M3.5 16.5h5.8l1.7 5.5c0.1 0.4-0.2 0.8-0.6 0.8H2.4c-0.4 0-0.7-0.4-0.6-0.8l1.7-5.5z" fill="currentColor" />
      <path d="M3.2 21.5h5.1m-4.2-3.5v3.5m1.7-3.5v3.5m1.6-3.5v3.5" stroke={isScrolled ? '#95C4A1' : '#1B4332'} strokeWidth="0.5" strokeLinecap="round" opacity="0.6" />

      {/* P - Loop */}
      <path d="M7 2.5h5.5c2.5 0 4.5 1.8 4.5 4.25s-2 4.25-4.5 4.25H7V2.5z M7 4.3v4.9h5.5c1.2 0 2.2-0.9 2.2-2.45s-1-2.45-2.2-2.45H7z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />

      {/* Spray bottle silhouette nested inside loop of P */}
      <rect x="9.2" y="6.8" width="2.2" height="4.2" rx="0.5" fill="currentColor" />
      <rect x="9.6" y="5.8" width="1.4" height="1.0" fill="currentColor" />
      <path d="M8.6 5.4c0-.2.1-.3.3-.3h1.8c.2 0 .3.1.3.3h-2.4z" fill="currentColor" />
      <path d="M9.1 6.0l-0.5 1.0" stroke={isScrolled ? '#1B4332' : 'white'} strokeWidth="0.7" strokeLinecap="round" />

      {/* T - Squeegee top bar */}
      <rect x="23" y="4.5" width="16" height="1.5" rx="0.4" fill="currentColor" />
      <rect x="25" y="3.5" width="12" height="1.0" rx="0.2" fill="currentColor" opacity="0.9" />
      <path d="M29 6.0l0.8 1.4h4.4l0.8-1.4z" fill="currentColor" />

      {/* T - Squeegee vertical handle rod */}
      <rect x="30.1" y="7.5" width="1.8" height="14.5" rx="0.5" fill="currentColor" />

      {/* Star Sparkle Accent elements top-right of T */}
      <path d="M38 1.5l0.5 1.2 1.2 0.5-1.2 0.5-0.5 1.2-0.5-1.2-1.2-0.5 1.2-0.5z" fill={isScrolled ? '#2D6A4F' : '#95C4A1'} />
      <path d="M40.5 4.2l0.35 0.8 0.8 0.35-0.8 0.35-0.35 0.8-0.35-0.8-0.8-0.35 0.8-0.35z" fill={isScrolled ? '#95C4A1' : '#B7E4C7'} />
    </svg>
  );
}

// Option 2 Emblem Component (Minimalist Modern)
// - Stylized layout matching the second image option
function Option2Icon({ isScrolled }: { isScrolled: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {/* Bold tall PT letters */}
      <span 
        className={`font-sans font-black text-2xl tracking-tighter leading-none select-none transition-colors duration-300 ${
          isScrolled ? 'text-[#1B4332]' : 'text-white'
        }`}
      >
        PT
      </span>
      {/* Geometric divider bar */}
      <div 
        className={`h-5 w-[1.5px] shrink-0 transition-colors duration-300 ${
          isScrolled ? 'bg-[#95C4A1]/60' : 'bg-white/40'
        }`} 
      />
    </div>
  );
}

export default function Logo({ isScrolled = true, logoStyle = 'option3' }: LogoProps) {
  // Select the appropriate icon component
  const renderIcon = () => {
    switch (logoStyle) {
      case 'option1':
        return <Option1Icon isScrolled={isScrolled} />;
      case 'option2':
        return <Option2Icon isScrolled={isScrolled} />;
      case 'option3':
      default:
        return <Option3Icon isScrolled={isScrolled} />;
    }
  };

  return (
    <div className="flex items-center gap-3.5 group">
      {/* Responsive Icon Container Wrapper */}
      <div className="flex-shrink-0 flex items-center justify-center">
        {renderIcon()}
      </div>

      {/* Typography stack that dynamically adjusts spacing based on selections */}
      <div className="flex flex-col select-none text-left">
        <span 
          className={`font-serif text-xl sm:text-2xl font-bold tracking-tight leading-none transition-colors duration-300 ${
            isScrolled ? 'text-[#1B4332]' : 'text-white'
          }`}
        >
          Puhdas Tila
        </span>
        <span 
          className={`text-[9px] sm:text-[10px] font-sans font-extrabold tracking-[0.24em] mt-1.5 transition-colors duration-300 ${
            isScrolled ? 'text-[#95C4A1]' : 'text-[#95C4A1]'
          }`}
          style={{ letterSpacing: '0.18em' }}
        >
          PROFESSIONAL CLEANING
        </span>
      </div>
    </div>
  );
}

