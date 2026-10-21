import React from 'react';

export interface BrandLogoProps {
  /**
   * 'light-bg': Neutral graphite (#1a1a1a) for light backgrounds like header/navbar
   * 'dark-bg': Neutral bone white (#f5f5f5) for dark backgrounds like footer
   */
  variant?: 'light-bg' | 'dark-bg';
  /**
   * Predefined standard size tokens or explicit class override
   */
  size?: 'navbar' | 'footer-header' | 'copyright-bar' | 'custom';
  className?: string;
  alt?: string;
}

const SIZE_CLASSES = {
  navbar: 'h-[32px] w-[32px] sm:h-[34px] sm:w-[34px]',
  'footer-header': 'h-[34px] w-[34px]',
  'copyright-bar': 'h-3.5 w-3.5 sm:h-4 sm:w-4',
  custom: '',
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'light-bg',
  size = 'navbar',
  className = '',
  alt = 'SALAH Studio Mark',
}) => {
  const isDarkBg = variant === 'dark-bg';
  const color = isDarkBg ? '#f5f5f5' : '#1a1a1a';
  const sizeClass = SIZE_CLASSES[size] || '';

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${sizeClass} ${className}`}
      role="img"
      aria-label={alt}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full object-contain"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Top 12 o'clock dot touching circle upper edge */}
        <circle cx="50" cy="7.2" r="3.6" fill={color} />

        {/* Clean, thin circular outline */}
        <circle cx="50" cy="52" r="40" stroke={color} strokeWidth="2.5" />

        {/* Normal standard font S */}
        <text
          x="50"
          y="66"
          textAnchor="middle"
          fill={color}
          fontFamily="system-ui, -apple-system, 'Inter', 'Helvetica Neue', Arial, sans-serif"
          fontSize="43"
          fontWeight="500"
          style={{ userSelect: 'none' }}
        >
          S
        </text>
      </svg>
    </span>
  );
};

export default BrandLogo;
