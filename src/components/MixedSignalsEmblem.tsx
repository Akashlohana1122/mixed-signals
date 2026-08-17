import React from 'react';

interface LogoProps {
  className?: string;
  size?: number | string;
  themeAccent?: string;
  glow?: boolean;
}

export const MixedSignalsEmblem: React.FC<LogoProps> = ({
  className = '',
  size = 280,
  themeAccent = '#06B6D4',
  glow = true,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 650 650"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none overflow-visible ${className}`}
      style={{
        filter: glow
          ? `drop-shadow(0 18px 45px rgba(0,0,0,0.98)) drop-shadow(0 0 35px ${themeAccent}88)`
          : undefined,
      }}
    >
      <defs>
        {/* Vinyl Record Radial & Linear Textures */}
        <radialGradient id="vinylBody" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#141724" />
          <stop offset="30%" stopColor="#22283A" />
          <stop offset="65%" stopColor="#0D0F17" />
          <stop offset="85%" stopColor="#1B2030" />
          <stop offset="100%" stopColor="#040508" />
        </radialGradient>

        <linearGradient id="vinylGlossSheen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
          <stop offset="20%" stopColor="transparent" />
          <stop offset="50%" stopColor="rgba(6,182,212,0.45)" />
          <stop offset="80%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.3)" />
        </linearGradient>

        {/* 3D High-Gloss Champagne Gold Gradients for Monogram MS */}
        <linearGradient id="goldHighlightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="12%" stopColor="#FFF9EB" />
          <stop offset="32%" stopColor="#F6E7C8" />
          <stop offset="60%" stopColor="#E2C898" />
          <stop offset="85%" stopColor="#BD985E" />
          <stop offset="100%" stopColor="#846633" />
        </linearGradient>

        <linearGradient id="goldBevelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="20%" stopColor="#FAF0DE" />
          <stop offset="55%" stopColor="#E5CFA5" />
          <stop offset="85%" stopColor="#C4A46D" />
          <stop offset="100%" stopColor="#93743E" />
        </linearGradient>

        <linearGradient id="goldDarkEdge" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A88344" />
          <stop offset="50%" stopColor="#634B22" />
          <stop offset="100%" stopColor="#33240D" />
        </linearGradient>

        <linearGradient id="goldWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0" />
          <stop offset="18%" stopColor="#FBBF24" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="82%" stopColor="#38BDF8" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
        </linearGradient>

        {/* 3D Depth Shadows */}
        <filter id="monogram3DShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="14" stdDeviation="9" floodColor="#000000" floodOpacity="0.98" />
          <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.85" />
        </filter>

        <filter id="sharpBevel" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2.5" dy="6" stdDeviation="3.5" floodColor="#000000" floodOpacity="0.92" />
          <feDropShadow dx="-1.5" dy="-1.5" stdDeviation="1.2" floodColor="#FFFFFF" floodOpacity="0.8" />
        </filter>

        <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ========================================================================= */}
      {/* 1. BACKGROUND GLOWING ORBITAL CABLES & STAR FLUID RIBBONS                 */}
      {/* ========================================================================= */}
      <g opacity="0.9">
        {/* Cable Ribbon 1 (Top Left to Bottom Right) */}
        <path
          d="M 95,280 C 65,115 170,45 325,50 C 510,55 585,175 565,340 C 540,500 410,590 250,565 C 140,555 65,445 85,290"
          stroke="url(#goldHighlightGrad)"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
          filter="url(#sharpBevel)"
        />
        {/* Secondary Glowing Blue Cable Accent */}
        <path
          d="M 130,260 C 105,150 195,80 325,85 C 465,90 540,190 525,325 C 510,455 400,520 270,510"
          stroke="#38BDF8"
          strokeWidth="2.4"
          fill="none"
          opacity="0.55"
          strokeDasharray="9 6"
        />
      </g>

      {/* ========================================================================= */}
      {/* 2. MAIN VINYL RECORD DISC WITH GROOVES & REFLECTIONS                     */}
      {/* ========================================================================= */}
      <g filter="url(#monogram3DShadow)">
        {/* Main Outer Rim */}
        <circle cx="325" cy="315" r="215" fill="url(#vinylBody)" stroke="#242A3E" strokeWidth="4" />
        <circle cx="325" cy="315" r="215" fill="url(#vinylGlossSheen)" opacity="0.8" />

        {/* Precision Grooves */}
        <circle cx="325" cy="315" r="198" stroke="rgba(255,255,255,0.08)" strokeWidth="1.2" fill="none" />
        <circle cx="325" cy="315" r="182" stroke="rgba(255,255,255,0.1)" strokeWidth="1.6" fill="none" />
        <circle cx="325" cy="315" r="165" stroke="rgba(255,255,255,0.07)" strokeWidth="1.2" fill="none" />
        <circle cx="325" cy="315" r="148" stroke="rgba(255,255,255,0.11)" strokeWidth="1.8" fill="none" />
        <circle cx="325" cy="315" r="132" stroke="rgba(255,255,255,0.08)" strokeWidth="1.2" fill="none" />
        <circle cx="325" cy="315" r="115" stroke="rgba(255,255,255,0.12)" strokeWidth="1.6" fill="none" />

        {/* Center Vinyl Spindle Ring */}
        <circle cx="325" cy="315" r="55" fill="#151928" stroke="url(#goldHighlightGrad)" strokeWidth="3" />
        <circle cx="325" cy="315" r="12" fill="#0A0C14" stroke="#FFFFFF" strokeWidth="1.2" />
      </g>

      {/* ========================================================================= */}
      {/* 3. HORIZONTAL SOUNDWAVE SPECTRUM (Left & Right Wings)                    */}
      {/* ========================================================================= */}
      <g filter="url(#starGlow)">
        <path
          d="M 15,315 
             L 60,315 L 70,300 L 80,328 L 90,290 L 100,340 L 110,275 L 120,355 L 130,280 L 140,350 L 150,295 L 160,330 L 175,315 
             L 475,315 L 490,298 L 500,338 L 510,285 L 520,348 L 530,280 L 540,352 L 550,295 L 560,340 L 570,305 L 580,325 L 635,315"
          stroke="url(#goldWaveGrad)"
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>

      {/* ========================================================================= */}
      {/* 4. OVER-EAR STUDIO MONITOR HEADPHONES                                    */}
      {/* ========================================================================= */}
      <g filter="url(#sharpBevel)">
        {/* Headband Arch */}
        <path
          d="M 150,260 C 140,120 250,60 335,60 C 430,60 520,120 510,260"
          stroke="#2A2F44"
          strokeWidth="22"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 150,260 C 140,120 250,60 335,60 C 430,60 520,120 510,260"
          stroke="url(#goldHighlightGrad)"
          strokeWidth="9"
          strokeLinecap="round"
          fill="none"
        />
        {/* Top Padded Cushion */}
        <path
          d="M 215,95 C 270,78 380,78 445,95"
          stroke="#111420"
          strokeWidth="15"
          strokeLinecap="round"
          fill="none"
        />

        {/* LEFT EAR CUP */}
        <g transform="translate(135, 270)">
          <rect x="-20" y="-38" width="9" height="28" rx="3.5" fill="url(#goldHighlightGrad)" />
          <ellipse cx="0" cy="0" rx="42" ry="60" fill="#141828" stroke="url(#goldHighlightGrad)" strokeWidth="5.5" />
          <ellipse cx="0" cy="0" rx="31" ry="46" fill="#1E2438" stroke="#434C6A" strokeWidth="2.2" />
          <circle cx="0" cy="0" r="16" fill="url(#goldBevelGrad)" stroke="#111" strokeWidth="1.2" />
          <path d="M -9,0 L -4,-7 L 0,9 L 4,-9 L 9,0" stroke="#67E8F9" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </g>

        {/* RIGHT EAR CUP */}
        <g transform="translate(525, 270)">
          <rect x="11" y="-38" width="9" height="28" rx="3.5" fill="url(#goldHighlightGrad)" />
          <ellipse cx="0" cy="0" rx="42" ry="60" fill="#141828" stroke="url(#goldHighlightGrad)" strokeWidth="5.5" />
          <ellipse cx="0" cy="0" rx="31" ry="46" fill="#1E2438" stroke="#434C6A" strokeWidth="2.2" />
          <circle cx="0" cy="0" r="16" fill="url(#goldBevelGrad)" stroke="#111" strokeWidth="1.2" />
        </g>
      </g>

      {/* ========================================================================= */}
      {/* 5. MASTERPIECE 3D MONOGRAM: BOTH 'M' AND 'S' PROMINENT & CRYSTAL CLEAR    */}
      {/* ========================================================================= */}
      
      {/* ------------------------------------------------------------------------- */}
      {/* MONOGRAM LETTER 'M' (Classic High-Contrast Luxury Serif Architecture)     */}
      {/* ------------------------------------------------------------------------- */}
      <g filter="url(#monogram3DShadow)">
        {/* Deep 3D Extrusion Bevel Shadow for M */}
        <path
          d="M 155,205 
             C 155,190 178,185 210,185 
             L 258,185 
             L 322,335 
             L 388,185 
             L 435,185 
             C 468,185 485,190 485,205 
             L 468,320 
             C 462,338 438,345 422,345 
             C 405,345 396,332 398,315 
             L 410,245 
             L 340,395 
             C 332,410 315,410 307,395 
             L 235,245 
             L 218,315 
             C 214,335 198,345 178,345 
             C 160,345 150,332 152,312 
             Z"
          fill="url(#goldDarkEdge)"
        />
        
        {/* Front Sculpted Champagne Gold Surface for M */}
        <path
          d="M 158,202 
             C 158,187 181,182 213,182 
             L 260,182 
             L 322,330 
             L 386,182 
             L 432,182 
             C 465,182 482,187 482,202 
             L 465,317 
             C 459,335 435,342 419,342 
             C 402,342 393,329 395,312 
             L 407,242 
             L 340,390 
             C 332,405 315,405 307,390 
             L 238,242 
             L 221,312 
             C 217,332 201,342 181,342 
             C 163,342 153,329 155,309 
             Z"
          fill="url(#goldBevelGrad)"
          stroke="url(#goldHighlightGrad)"
          strokeWidth="3.8"
          filter="url(#sharpBevel)"
        />
        
        {/* Internal Ridge Highlight on M's Stems */}
        <path
          d="M 198,200 L 198,305 M 242,215 L 318,380 M 405,215 L 328,380 M 445,200 L 445,305"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.7"
        />
      </g>

      {/* ------------------------------------------------------------------------- */}
      {/* MONOGRAM LETTER 'S' (Bold, Distinct Front Layer with Golden 3D Volume)   */}
      {/* ------------------------------------------------------------------------- */}
      <g filter="url(#monogram3DShadow)">
        {/* 3D Extrusion Shadow for S */}
        <path
          d="M 480,210 
             C 480,210 395,238 348,290 
             C 310,340 305,388 348,442 
             C 390,490 462,490 490,472 
             C 518,450 514,420 485,400 
             C 452,378 385,385 358,345 
             C 336,315 348,282 382,258 
             C 424,230 478,240 500,228 
             C 512,218 502,210 480,210 
             Z"
          fill="url(#goldDarkEdge)"
        />

        {/* Front Sculpted Champagne Gold Surface for S */}
        <path
          d="M 477,207 
             C 477,207 392,235 345,287 
             C 307,337 302,385 345,439 
             C 387,487 459,487 487,469 
             C 515,447 511,417 482,397 
             C 449,375 382,382 355,342 
             C 333,312 345,279 379,255 
             C 421,227 475,237 497,225 
             C 509,215 499,207 477,207 
             Z"
          fill="url(#goldHighlightGrad)"
          stroke="#FFFFFF"
          strokeWidth="4"
          filter="url(#sharpBevel)"
        />

        {/* Lower Sweeping Tail Loop of S */}
        <path
          d="M 345,439 
             C 305,490 238,530 175,508 
             C 135,492 130,455 168,438 
             C 208,422 255,442 305,426 
             Z"
          fill="url(#goldHighlightGrad)"
          stroke="#FFFFFF"
          strokeWidth="3.2"
          filter="url(#sharpBevel)"
        />

        {/* Sculpted Center Spine Highlights on S */}
        <path
          d="M 465,232 C 410,260 360,302 368,352 C 375,402 445,412 472,440 C 485,455 472,470 445,475 C 395,485 335,465 290,442"
          stroke="#FFFFFF"
          strokeWidth="2.8"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        />
      </g>

      {/* ========================================================================= */}
      {/* 6. VINTAGE CASSETTE TAPE LABELED "Mixed Signals" AT BOTTOM                */}
      {/* ========================================================================= */}
      <g transform="translate(245, 410) scale(0.95)" filter="url(#monogram3DShadow)">
        {/* Outer Cassette Housing */}
        <rect x="0" y="0" width="170" height="104" rx="9" fill="#141828" stroke="url(#goldHighlightGrad)" strokeWidth="4.5" />
        
        {/* Cassette Label Strip */}
        <rect x="18" y="14" width="134" height="64" rx="5" fill="#F4EADB" />
        
        {/* Label Title "Mixed Signals" */}
        <text
          x="85"
          y="36"
          textAnchor="middle"
          fill="#161822"
          fontFamily="serif"
          fontStyle="italic"
          fontWeight="900"
          fontSize="19"
          letterSpacing="1"
        >
          Mixed Signals
        </text>

        {/* Spool Windows & Wheels */}
        <rect x="27" y="45" width="116" height="27" rx="13.5" fill="#1F2538" stroke="#141828" strokeWidth="2.2" />
        <circle cx="52" cy="58" r="9.5" fill="#F4EADB" stroke="#141828" strokeWidth="3.2" />
        <circle cx="118" cy="58" r="9.5" fill="#F4EADB" stroke="#141828" strokeWidth="3.2" />
        <rect x="70" y="52" width="30" height="13" fill="#0C0E1A" rx="2" />
      </g>

      {/* ========================================================================= */}
      {/* 7. GOLD 3.5mm HEADPHONE JACK PLUG CABLE                                  */}
      {/* ========================================================================= */}
      <g transform="translate(280, 545) rotate(-12)" filter="url(#monogram3DShadow)">
        {/* Rubber Cable Cord */}
        <path d="M -45,-15 C 10,22 65,28 120,0" stroke="#151828" strokeWidth="9" strokeLinecap="round" fill="none" />
        <path d="M -45,-15 C 10,22 65,28 120,0" stroke="url(#goldHighlightGrad)" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        
        {/* Jack Connector Body */}
        <g transform="translate(120, 0) rotate(35)">
          <rect x="0" y="0" width="18" height="34" rx="4" fill="#1A1E30" stroke="url(#goldHighlightGrad)" strokeWidth="2" />
          <rect x="4.5" y="34" width="9" height="28" fill="url(#goldBevelGrad)" stroke="#8A6E3F" strokeWidth="1.2" />
          <line x1="4.5" y1="42" x2="13.5" y2="42" stroke="#000" strokeWidth="2" />
          <line x1="4.5" y1="51" x2="13.5" y2="51" stroke="#000" strokeWidth="2" />
        </g>
      </g>

      {/* ========================================================================= */}
      {/* 8. 4-POINT BRILLIANT STAR LENS FLARES & DIAMOND SPARKLES                 */}
      {/* ========================================================================= */}
      {/* Big Diamond Star (Top Right) */}
      <g transform="translate(505, 105)" filter="url(#starGlow)">
        <path d="M 0,-26 L 5.5,-5.5 L 26,0 L 5.5,5.5 L 0,26 L -5.5,5.5 L -26,0 L -5.5,-5.5 Z" fill="#FFFFFF" stroke="#FDE047" strokeWidth="1.6" />
      </g>
      {/* Mid Left Diamond Sparkle */}
      <g transform="translate(215, 390)" filter="url(#starGlow)">
        <path d="M 0,-15 L 3.5,-3.5 L 15,0 L 3.5,3.5 L 0,15 L -3.5,3.5 L -15,0 L -3.5,-3.5 Z" fill="#FFFFFF" stroke="#38BDF8" strokeWidth="1.2" />
      </g>
      {/* Right Diamond Sparkle */}
      <g transform="translate(455, 195)" filter="url(#starGlow)">
        <path d="M 0,-11 L 3,-3 L 11,0 L 3,3 L 0,11 L -3,3 L -11,0 L -3,-3 Z" fill="#FFFFFF" stroke="#FDE047" strokeWidth="1" />
      </g>
      {/* Bottom Sparkle */}
      <g transform="translate(310, 525)" filter="url(#starGlow)">
        <path d="M 0,-13 L 3.5,-3.5 L 13,0 L 3.5,3.5 L 0,13 L -3.5,3.5 L -13,0 L -3.5,-3.5 Z" fill="#FFFFFF" stroke="#67E8F9" strokeWidth="1.2" />
      </g>
    </svg>
  );
};
