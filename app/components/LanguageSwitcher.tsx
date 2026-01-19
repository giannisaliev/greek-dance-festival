"use client";

import { useLanguage } from '@/lib/i18n/LanguageContext';
import Image from 'next/image';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative group">
      <button
        onClick={() => setLanguage(language === 'en' ? 'el' : 'en')}
        className="relative flex items-center gap-3 px-4 py-2.5 rounded-full bg-gradient-to-r from-white/20 via-white/15 to-white/10 hover:from-white/30 hover:via-white/25 hover:to-white/20 backdrop-blur-lg border-2 border-white/40 hover:border-white/60 transition-all duration-500 shadow-2xl hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transform hover:scale-110 overflow-hidden"
        aria-label="Switch language"
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-gradient-shift"></div>
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-slow"></div>
        
        {/* Flag container with 3D flip animation */}
        <div className="relative w-8 h-8 flex items-center justify-center perspective-1000">
          <div className={`absolute w-full h-full transition-all duration-700 transform-style-3d ${
            language === 'en' 
              ? 'rotate-y-0 opacity-100' 
              : 'rotate-y-180 opacity-0'
          }`}>
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/50 shadow-lg bg-white backface-hidden">
              <img 
                src="https://flagcdn.com/w80/gb.png"
                alt="English"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className={`absolute w-full h-full transition-all duration-700 transform-style-3d ${
            language === 'el' 
              ? 'rotate-y-0 opacity-100' 
              : '-rotate-y-180 opacity-0'
          }`}>
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/50 shadow-lg bg-white backface-hidden">
              <img 
                src="https://flagcdn.com/w80/gr.png"
                alt="Greek"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
        
        {/* Language code with animated gradient text */}
        <span className="relative z-10 text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white animate-text-shimmer tracking-wider">
          {language.toUpperCase()}
        </span>
        
        {/* Swap icon with rotation animation */}
        <svg 
          className="relative z-10 w-4 h-4 text-white/90 transition-transform duration-500 group-hover:rotate-180" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        
        {/* Pulsing glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-pink-400/30 blur-xl group-hover:blur-2xl transition-all duration-500 animate-pulse-slow"></div>
      </button>
      
      {/* Enhanced tooltip with flag preview */}
      <div className="absolute top-full mt-3 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 scale-90 group-hover:scale-100">
        <div className="bg-gradient-to-br from-white via-blue-50 to-white backdrop-blur-xl text-blue-900 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap shadow-2xl border-2 border-blue-300/50 flex items-center gap-2">
          <div className="w-5 h-5 rounded-full overflow-hidden border border-blue-300 shadow-sm">
            <img 
              src={language === 'en' ? "https://flagcdn.com/w40/gr.png" : "https://flagcdn.com/w40/gb.png"}
              alt="Next language"
              className="w-full h-full object-cover"
            />
          </div>
          <span>{language === 'en' ? 'Ελληνικά' : 'English'}</span>
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gradient-to-br from-white to-blue-50 rotate-45 border-l-2 border-t-2 border-blue-300/50"></div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes shimmer-slow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        
        @keyframes text-shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
        
        .animate-shimmer-slow {
          animation: shimmer-slow 3s ease-in-out infinite;
        }
        
        .animate-text-shimmer {
          background-size: 200% 200%;
          animation: text-shimmer 3s ease infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        
        .backface-hidden {
          backface-visibility: hidden;
        }
        
        .rotate-y-0 {
          transform: rotateY(0deg);
        }
        
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        
        .-rotate-y-180 {
          transform: rotateY(-180deg);
        }
      `}</style>
    </div>
  );
}
