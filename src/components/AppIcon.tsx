'use client';

import React from 'react';
import Image from 'next/image';
import { clsx } from 'clsx';

interface AppIconProps {
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

interface AppLogoConfig {
  src: string;
  bgClass: string;
  paddingClass: string;
}

function getAppLogo(name: string): AppLogoConfig | null {
  const normalized = name.toLowerCase().replace(/[\s\-_]/g, '');

  if (normalized.includes('googledrive') || normalized === 'gdrive' || normalized === 'drive') {
    return {
      src: '/logos/google-drive.png',
      bgClass: 'bg-[#181818] border border-[#2c2c2c]',
      paddingClass: 'p-[2px]',
    };
  }

  if (normalized.includes('slack')) {
    return {
      src: '/logos/slack.png',
      bgClass: 'bg-[#181818] border border-[#2c2c2c]',
      paddingClass: 'p-[2px]',
    };
  }

  if (normalized.includes('github')) {
    return {
      src: '/logos/github.png',
      bgClass: 'bg-white border border-[#e5e5e5]',
      paddingClass: 'p-[2px]',
    };
  }

  if (normalized.includes('hubspot')) {
    return {
      src: '/logos/hubspot.png',
      bgClass: 'bg-[#181818] border border-[#2c2c2c]',
      paddingClass: 'p-[2px]',
    };
  }

  if (normalized.includes('linear')) {
    return {
      src: '/logos/linear.png',
      bgClass: 'bg-white border border-[#e5e5e5]',
      paddingClass: 'p-[2.5px]',
    };
  }

  if (normalized.includes('notion')) {
    return {
      src: '/logos/notion.png',
      bgClass: 'bg-white border border-[#e5e5e5]',
      paddingClass: 'p-[2px]',
    };
  }

  if (normalized.includes('salesforce')) {
    return {
      src: '/logos/salesforce.png',
      bgClass: 'bg-[#181818] border border-[#2c2c2c]',
      paddingClass: 'p-[1.5px]',
    };
  }

  if (normalized.includes('zoom')) {
    return {
      src: '/logos/zoom.png',
      bgClass: 'bg-[#181818] border border-[#2c2c2c]',
      paddingClass: 'p-[1.5px]',
    };
  }

  if (normalized.includes('spotify')) {
    return {
      src: '/logos/spotify.png',
      bgClass: 'bg-[#181818] border border-[#2c2c2c]',
      paddingClass: 'p-[2px]',
    };
  }

  if (normalized.includes('stripe')) {
    return {
      src: '/logos/stripe.png',
      bgClass: 'bg-[#181818] border border-[#2c2c2c]',
      paddingClass: 'p-[1.5px]',
    };
  }

  return null;
}

export function AppIcon({ name, className, size = 'sm' }: AppIconProps) {
  const sizeClasses = {
    sm: 'w-5 h-5 rounded-[5px]',
    md: 'w-6 h-6 rounded-[6px]',
    lg: 'w-7 h-7 rounded-[7px]',
  }[size];

  const logo = getAppLogo(name);

  if (logo) {
    return (
      <div
        className={clsx(
          sizeClasses,
          logo.bgClass,
          logo.paddingClass,
          'flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden select-none',
          className
        )}
        title={name}
      >
        <Image
          src={logo.src}
          alt={name}
          width={28}
          height={28}
          className="w-full h-full object-contain pointer-events-none"
          unoptimized
        />
      </div>
    );
  }

  // Fallback: Clean integration monogram tile for unlisted or newly generated apps
  return (
    <div
      className={clsx(
        sizeClasses,
        'bg-[#1e1e1e] border border-[#2e2e2e] text-[#a0a0a0] flex items-center justify-center flex-shrink-0 font-mono font-semibold text-[10px] shadow-sm select-none',
        className
      )}
      title={name}
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}
