'use client';

import React from 'react';
import { clsx } from 'clsx';

interface AppIconProps {
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AppIcon({ name, className, size = 'sm' }: AppIconProps) {
  const normalized = (name || '').toLowerCase().replace(/[\s\-_]/g, '');

  const sizeClasses = {
    sm: 'w-5 h-5 rounded-[5px]',
    md: 'w-6 h-6 rounded-[6px]',
    lg: 'w-7 h-7 rounded-[7px]',
  }[size];

  const iconSizeClasses = {
    sm: 'w-[13px] h-[13px]',
    md: 'w-[15px] h-[15px]',
    lg: 'w-[17px] h-[17px]',
  }[size];

  // 1. Google Drive: Official 4-color Google Drive polygon mark
  if (normalized.includes('googledrive') || normalized === 'gdrive' || normalized === 'drive') {
    return (
      <div
        className={clsx(
          sizeClasses,
          'bg-[#141414] border border-[#242424] flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden select-none',
          className
        )}
        title={name}
      >
        <svg viewBox="0 0 87.3 78" className={iconSizeClasses} fill="none">
          <path
            d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z"
            fill="#0066DA"
          />
          <path
            d="M43.65 25 29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44A8.9 8.9 0 0 0 0 53h27.5z"
            fill="#00AC47"
          />
          <path
            d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l6.1 10.6z"
            fill="#EA4335"
          />
          <path
            d="M43.65 25 57.4 1.2C56.05.4 54.5 0 52.9 0H34.4c-1.6 0-3.15.45-4.5 1.2z"
            fill="#00832D"
          />
          <path
            d="M59.8 53H27.5L13.75 76.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z"
            fill="#2684FC"
          />
          <path
            d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25 59.8 53h27.45c0-1.55-.4-3.1-1.2-4.5z"
            fill="#FFBA00"
          />
        </svg>
      </div>
    );
  }

  // 2. Slack: Official 4-color Slack hashtag logo
  if (normalized.includes('slack')) {
    return (
      <div
        className={clsx(
          sizeClasses,
          'bg-[#141414] border border-[#242424] flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden select-none',
          className
        )}
        title={name}
      >
        <svg viewBox="0 0 128 128" className={iconSizeClasses}>
          <path
            d="M26.7 80.5a13.3 13.3 0 1 1-13.4-13.3h13.4v13.3zm6.6 0a13.3 13.3 0 1 1 26.7 0v33.4a13.3 13.3 0 1 1-26.7 0V80.5z"
            fill="#E01E5A"
          />
          <path
            d="M47.4 26.7a13.3 13.3 0 1 1 13.3-13.4V26.7H47.4zm0 6.6a13.3 13.3 0 1 1 0 26.7H14a13.3 13.3 0 1 1 0-26.7h33.4z"
            fill="#36C5F0"
          />
          <path
            d="M101.3 47.4a13.3 13.3 0 1 1 13.4 13.3h-13.4V47.4zm-6.6 0a13.3 13.3 0 1 1-26.7 0V14a13.3 13.3 0 1 1 26.7 0v33.4z"
            fill="#2EB67D"
          />
          <path
            d="M80.5 101.3a13.3 13.3 0 1 1-13.3 13.4V101.3h13.3zm0-6.6a13.3 13.3 0 1 1 0-26.7H114a13.3 13.3 0 1 1 0 26.7H80.5z"
            fill="#ECB22E"
          />
        </svg>
      </div>
    );
  }

  // 3. GitHub: Official GitHub Invertocat
  if (normalized.includes('github')) {
    return (
      <div
        className={clsx(
          sizeClasses,
          'bg-[#181818] border border-[#262626] flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden select-none',
          className
        )}
        title={name}
      >
        <svg viewBox="0 0 24 24" className={iconSizeClasses} fill="white">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          />
        </svg>
      </div>
    );
  }

  // 4. HubSpot: Official HubSpot sprocket mark
  if (normalized.includes('hubspot')) {
    return (
      <div
        className={clsx(
          sizeClasses,
          'bg-[#181818] border border-[#262626] flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden select-none',
          className
        )}
        title={name}
      >
        <svg viewBox="0 0 24 24" className={iconSizeClasses} fill="none">
          <path
            d="M17.8 7.2a2.3 2.3 0 10-2.3-2.3v1.8l-3.3 1.9V5.1a1.9 1.9 0 10-1.5 0v3.5l-3.3-1.9V4.9a2.3 2.3 0 10-2.3 2.3c0 .3.07.6.2.86L8.6 9.9v4.2L5.3 16a2.3 2.3 0 101.4 1.2l3.5-2v3.7a1.9 1.9 0 101.5 0v-3.7l3.5 2a2.3 2.3 0 101.4-1.2l-3.3-1.9V9.9l3.3-1.9c.2.14.47.2.7.2z"
            fill="#FF7A59"
          />
          <circle cx="12" cy="12" r="2.2" fill="#FF7A59" />
        </svg>
      </div>
    );
  }

  // 5. Linear: Official Linear geometric mark in brand #5E6AD2
  if (normalized.includes('linear')) {
    return (
      <div
        className={clsx(
          sizeClasses,
          'bg-[#181818] border border-[#262626] flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden select-none',
          className
        )}
        title={name}
      >
        <svg viewBox="0 0 24 24" className={iconSizeClasses} fill="none">
          <path
            d="M3.5 13.5L13.5 3.5a1.4 1.4 0 012 0l5 5a1.4 1.4 0 010 2L10.5 20.5a1.4 1.4 0 01-2 0l-5-5a1.4 1.4 0 010-2z"
            fill="#5E6AD2"
            fillOpacity="0.4"
          />
          <path
            d="M3.9 15.5l9.9-9.9c.4-.4 1-.4 1.4 0l4.9 4.9c.4.4.4 1 0 1.4L10.2 21.8c-.4.4-1 .4-1.4 0L3.9 16.9c-.4-.4-.4-1 0-1.4z"
            fill="#5E6AD2"
          />
        </svg>
      </div>
    );
  }

  // 6. Notion: Official Notion crisp 'N' tile on white
  if (normalized.includes('notion')) {
    return (
      <div
        className={clsx(
          sizeClasses,
          'bg-white border border-[#e5e5e5] flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden select-none',
          className
        )}
        title={name}
      >
        <svg viewBox="0 0 24 24" className={iconSizeClasses} fill="black">
          <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l11.458-.823c1.026-.074 1.282.28 1.048.979l-2.008 5.786 5.395 10.158c.42.747.14 1.354-.746 1.401l-14.77.886c-1.074.07-1.448-.303-1.635-.77L2.4 15.539c-.28-.7-.046-1.097.653-1.144l9.24-.653-4.994-9.534H4.46zm3.504 15.424l9.566-.574-4.887-9.3-9.588.686 4.909 9.188z" />
        </svg>
      </div>
    );
  }

  // 7. Salesforce: Official Salesforce cloud in brand #00A1E0
  if (normalized.includes('salesforce')) {
    return (
      <div
        className={clsx(
          sizeClasses,
          'bg-[#141414] border border-[#242424] flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden select-none',
          className
        )}
        title={name}
      >
        <svg viewBox="0 0 24 24" className={iconSizeClasses} fill="#00A1E0">
          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z" />
        </svg>
      </div>
    );
  }

  // 8. Zoom: Official Zoom video camera in brand #2D8CFF
  if (normalized.includes('zoom')) {
    return (
      <div
        className={clsx(
          sizeClasses,
          'bg-[#141414] border border-[#242424] flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden select-none',
          className
        )}
        title={name}
      >
        <svg viewBox="0 0 24 24" className={iconSizeClasses} fill="none">
          <rect x="4" y="6" width="11" height="12" rx="2.2" fill="#2D8CFF" />
          <path d="M15 10.2l4.8-3.3v10.2L15 13.8v-3.6z" fill="#2D8CFF" />
        </svg>
      </div>
    );
  }

  // 9. Spotify: Official Spotify soundwaves in brand #1ED760
  if (normalized.includes('spotify')) {
    return (
      <div
        className={clsx(
          sizeClasses,
          'bg-[#141414] border border-[#242424] flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden select-none',
          className
        )}
        title={name}
      >
        <svg viewBox="0 0 24 24" className={iconSizeClasses} fill="none">
          <circle cx="12" cy="12" r="10" fill="#1ED760" />
          <path
            d="M16.5 15.2a.5.5 0 01-.7.2c-2-1.2-4.5-1.5-7.5-.8a.5.5 0 11-.2-1c3.2-.7 6-.4 8.2.9.3.2.4.5.2.7zm1-2.4a.7.7 0 01-.9.2c-2.4-1.4-6-1.9-8.8-1a.7.7 0 11-.4-1.3c3.2-1 7.2-.5 10 1a.7.7 0 01.1 1.1zm.1-2.5c-2.8-1.7-7.5-1.9-10.2-1a.8.8 0 11-.5-1.6c3.2-1 8.3-.8 11.5 1.1a.8.8 0 01-.8 1.5z"
            fill="#000000"
          />
        </svg>
      </div>
    );
  }

  // 10. Stripe: Official Stripe 'S' in brand #635BFF
  if (normalized.includes('stripe')) {
    return (
      <div
        className={clsx(
          sizeClasses,
          'bg-[#141414] border border-[#242424] flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden select-none',
          className
        )}
        title={name}
      >
        <svg viewBox="0 0 24 24" className={iconSizeClasses} fill="none">
          <path
            d="M14.5 10.4c0-1-.8-1.5-2.2-1.5-1.4 0-2.8.5-3.8 1.1v-2.3c1.1-.5 2.6-.8 4.1-.8 3 0 5 1.5 5 4.1v5.6h-2.9v-1.1c-.9.9-2.1 1.3-3.3 1.3-2.1 0-3.5-1.2-3.5-3.1 0-2.2 1.8-3.1 4.5-3.1.8 0 1.5.1 2.1.2v-.4zm-2.9 4.3c1 0 1.9-.5 2.4-1.2v-1.2c-.5-.1-1.1-.2-1.8-.2-1.5 0-2.4.5-2.4 1.5 0 .7.6 1.1 1.8 1.1z"
            fill="#635BFF"
          />
        </svg>
      </div>
    );
  }

  // Fallback: Clean integration monogram tile for unlisted or newly generated apps
  return (
    <div
      className={clsx(
        sizeClasses,
        'bg-[#141414] border border-[#242424] text-[#888888] flex items-center justify-center flex-shrink-0 font-mono font-medium text-[10px] select-none',
        className
      )}
      title={name}
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}
