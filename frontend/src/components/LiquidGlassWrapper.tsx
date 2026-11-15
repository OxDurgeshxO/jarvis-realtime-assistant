import React from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export default function LiquidGlassWrapper({
  children,
  className = "",
  glowColor = "rgba(56, 225, 255, 0.15)",
}: Props) {
  return (
    <div className={`relative ${className}`}>
      {/* SVG Liquid Refraction Filter */}
      <svg className="absolute h-0 w-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="liquid-disp-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.035 0.035"
              numOctaves="2"
              result="turbulence"
              seed="24"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="turbulence"
              scale="7"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            <feGaussianBlur in="displaced" stdDeviation="0.3" result="blurred" />
            <feMerge>
              <feMergeNode in="blurred" />
              <feMergeNode in="SourceGraphic" opacity="0.9" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Glass Backing Layer */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none border border-cyan-400/20 transition-all duration-500"
        style={{
          background: "linear-gradient(145deg, rgba(16, 36, 64, 0.75) 0%, rgba(8, 16, 32, 0.85) 100%)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow: `0 8px 32px 0 ${glowColor}, inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)`,
        }}
      />

      {/* Content Body */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
