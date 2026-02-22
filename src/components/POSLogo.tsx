import React from 'react';

interface POSLogoProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export function POSLogo({ className = '', size = 'medium' }: POSLogoProps) {
  const sizeMap = {
    small: { width: 120, height: 60, fontSize: 24 },
    medium: { width: 200, height: 100, fontSize: 40 },
    large: { width: 300, height: 150, fontSize: 60 },
  };

  const config = sizeMap[size];

  return (
    <svg
      viewBox="0 0 300 150"
      width={config.width}
      height={config.height}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Text */}
      <text
        x="150"
        y="55"
        fontFamily="Arial, sans-serif"
        fontSize={config.fontSize}
        fontWeight="bold"
        textAnchor="middle"
        letterSpacing="2"
      >
        <tspan fill="#0052CC" fontStyle="italic">
          POS
        </tspan>
        <tspan fill="#22AA00" fontStyle="italic">
          s
        </tspan>
        <tspan fill="#FF8800" fontStyle="italic">
          y
        </tspan>
        <tspan fill="#22AA00" fontStyle="italic">
          s
        </tspan>
        <tspan fill="#FF8800" fontStyle="italic">
          t
        </tspan>
        <tspan fill="#22AA00" fontStyle="italic">
          e
        </tspan>
        <tspan fill="#FF8800" fontStyle="italic">
          m
        </tspan>
      </text>

      {/* Decorative line */}
      <path
        d="M 50 85 Q 100 95, 150 92 T 250 85"
        stroke="none"
        fill="none"
      />

      {/* Decorative curves - Orange */}
      <path
        d="M 60 90 Q 90 100, 140 95"
        stroke="#FF8800"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />

      {/* Decorative curves - Green */}
      <path
        d="M 150 98 Q 180 92, 220 98"
        stroke="#22AA00"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />

      {/* Decorative curves - Yellow/Gold */}
      <path
        d="M 230 95 Q 250 88, 270 93"
        stroke="#FFAA00"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
