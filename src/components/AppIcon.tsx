'use client';

import React from 'react';
import { clsx } from 'clsx';

interface AppIconProps {
  name: string;
  className?: string;
  size?: number;
}

export function AppIcon({ name, className = 'w-4 h-4', size }: AppIconProps) {
  const normalized = name.toLowerCase().replace(/[\s\-_]/g, '');
  const style = size ? { width: size, height: size } : undefined;

  // Google Drive
  if (normalized.includes('googledrive') || normalized === 'gdrive' || normalized === 'drive') {
    return (
      <svg
        viewBox="0 0 24 24"
        className={clsx('flex-shrink-0', className)}
        style={style}
        fill="none"
        aria-label="Google Drive"
      >
        <path d="M8.667 3.5h6.666l6.667 11.547H15.333z" fill="#FFC107" />
        <path d="M2 15.047l3.333 5.774h13.334l-3.334-5.774z" fill="#0F9D58" />
        <path d="M8.667 3.5L2 15.047l3.333 5.774L12 9.274z" fill="#4285F4" />
      </svg>
    );
  }

  // Slack
  if (normalized.includes('slack')) {
    return (
      <svg
        viewBox="0 0 24 24"
        className={clsx('flex-shrink-0', className)}
        style={style}
        fill="none"
        aria-label="Slack"
      >
        {/* Blue */}
        <path
          d="M5.5 10.5C4.67 10.5 4 9.83 4 9s.67-1.5 1.5-1.5H9v3H5.5zm0-4.5C4.67 6 4 5.33 4 4.5S4.67 3 5.5 3s1.5.67 1.5 1.5V6H5.5z"
          fill="#36C5F0"
        />
        {/* Green */}
        <path
          d="M10.5 18.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5V15h3v3.5zm-4.5 0c0 .83-.67 1.5-1.5 1.5S3 19.33 3 18.5s.67-1.5 1.5-1.5H6v1.5z"
          fill="#2EB67D"
        />
        {/* Red */}
        <path
          d="M18.5 13.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5H15v-3h3.5zm0 4.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5V18h1.5z"
          fill="#E01E5A"
        />
        {/* Yellow */}
        <path
          d="M13.5 5.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V9h-3V5.5zm4.5 0c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5H18V5.5z"
          fill="#ECB22E"
        />
      </svg>
    );
  }

  // GitHub
  if (normalized.includes('github')) {
    return (
      <svg
        viewBox="0 0 24 24"
        className={clsx('flex-shrink-0 fill-current text-white', className)}
        style={style}
        aria-label="GitHub"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        />
      </svg>
    );
  }

  // HubSpot
  if (normalized.includes('hubspot')) {
    return (
      <svg
        viewBox="0 0 24 24"
        className={clsx('flex-shrink-0', className)}
        style={style}
        fill="none"
        aria-label="HubSpot"
      >
        <path
          d="M17.8 7.2a2.3 2.3 0 10-2.3-2.3v1.8l-3.3 1.9V5.1a1.9 1.9 0 10-1.5 0v3.5l-3.3-1.9V4.9a2.3 2.3 0 10-2.3 2.3c0 .3.07.6.2.86L8.6 9.9v4.2L5.3 16a2.3 2.3 0 101.4 1.2l3.5-2v3.7a1.9 1.9 0 101.5 0v-3.7l3.5 2a2.3 2.3 0 101.4-1.2l-3.3-1.9V9.9l3.3-1.9c.2.14.47.2.7.2z"
          fill="#FF7A59"
        />
        <circle cx="12" cy="12" r="2.2" fill="#FF7A59" />
      </svg>
    );
  }

  // Linear
  if (normalized.includes('linear')) {
    return (
      <svg
        viewBox="0 0 24 24"
        className={clsx('flex-shrink-0', className)}
        style={style}
        fill="none"
        aria-label="Linear"
      >
        <path
          d="M3.2 14.8L14.8 3.2c.4-.4 1.1-.4 1.5 0l4.5 4.5c.4.4.4 1.1 0 1.5L9.2 20.8c-.4.4-1.1.4-1.5 0l-4.5-4.5c-.4-.4-.4-1.1 0-1.5z"
          fill="#5E6AD2"
        />
        <path
          d="M8.5 20.1L3.9 15.5c-.3-.3-.3-.8 0-1.1L14.4 3.9"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // Notion
  if (normalized.includes('notion')) {
    return (
      <svg
        viewBox="0 0 24 24"
        className={clsx('flex-shrink-0 fill-current text-white', className)}
        style={style}
        aria-label="Notion"
      >
        <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l11.458-.823c1.026-.074 1.282.28 1.048.979l-2.008 5.786 5.395 10.158c.42.747.14 1.354-.746 1.401l-14.77.886c-1.074.07-1.448-.303-1.635-.77L2.4 15.539c-.28-.7-.046-1.097.653-1.144l9.24-.653-4.994-9.534H4.46zm3.504 15.424l9.566-.574-4.887-9.3-9.588.686 4.909 9.188z" />
      </svg>
    );
  }

  // Zoom
  if (normalized.includes('zoom')) {
    return (
      <svg
        viewBox="0 0 24 24"
        className={clsx('flex-shrink-0', className)}
        style={style}
        fill="none"
        aria-label="Zoom"
      >
        <rect width="24" height="24" rx="5" fill="#2D8CFF" />
        <path
          d="M6 8.5C6 7.67 6.67 7 7.5 7h6c.83 0 1.5.67 1.5 1.5v7c0 .83-.67 1.5-1.5 1.5h-6C6.67 17 6 16.33 6 15.5v-7z"
          fill="#FFFFFF"
        />
        <path
          d="M15 10.2l3-2.1c.4-.3.9 0 .9.5v6.8c0 .5-.5.8-.9.5l-3-2.1v-3.6z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  // Salesforce
  if (normalized.includes('salesforce')) {
    return (
      <svg
        viewBox="0 0 24 24"
        className={clsx('flex-shrink-0', className)}
        style={style}
        fill="none"
        aria-label="Salesforce"
      >
        <path
          d="M9.8 6.5a4.2 4.2 0 013.9 2.6 3.6 3.6 0 014.5 3.5c0 .3-.04.6-.1.9A3.8 3.8 0 0117 21H7a4.5 4.5 0 01-1.3-8.8 4 4 0 014.1-5.7z"
          fill="#00A1E0"
        />
      </svg>
    );
  }

  // Spotify
  if (normalized.includes('spotify')) {
    return (
      <svg
        viewBox="0 0 24 24"
        className={clsx('flex-shrink-0', className)}
        style={style}
        fill="none"
        aria-label="Spotify"
      >
        <circle cx="12" cy="12" r="10" fill="#1ED760" />
        <path
          d="M16.5 16.2a.6.6 0 01-.8.2c-2.3-1.4-5.2-1.7-8.6-.9a.6.6 0 11-.3-1.2c3.7-.8 6.9-.5 9.5 1.1.3.2.4.6.2.8zm1.2-2.7a.8.8 0 01-1 .3c-2.7-1.6-6.7-2.1-9.9-1.1a.8.8 0 11-.4-1.5c3.6-1.1 8-.6 11.1 1.3.3.2.4.7.2 1zm.1-2.8c-3.2-1.9-8.5-2.1-11.6-1.1a.9.9 0 11-.6-1.8c3.6-1.1 9.4-.9 13.1 1.3a.9.9 0 01-.9 1.6z"
          fill="#000000"
        />
      </svg>
    );
  }

  // Stripe
  if (normalized.includes('stripe')) {
    return (
      <svg
        viewBox="0 0 24 24"
        className={clsx('flex-shrink-0', className)}
        style={style}
        fill="none"
        aria-label="Stripe"
      >
        <rect width="24" height="24" rx="5" fill="#635BFF" />
        <path
          d="M14.5 10.4c0-1-.8-1.5-2.2-1.5-1.4 0-2.8.5-3.8 1.1v-2.3c1.1-.5 2.6-.8 4.1-.8 3 0 5 1.5 5 4.1v5.6h-2.9v-1.1c-.9.9-2.1 1.3-3.3 1.3-2.1 0-3.5-1.2-3.5-3.1 0-2.2 1.8-3.1 4.5-3.1.8 0 1.5.1 2.1.2v-.4zm-2.9 4.3c1 0 1.9-.5 2.4-1.2v-1.2c-.5-.1-1.1-.2-1.8-.2-1.5 0-2.4.5-2.4 1.5 0 .7.6 1.1 1.8 1.1z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  // Default clean integration badge
  return (
    <div
      className={clsx(
        'rounded flex items-center justify-center bg-[#202020] border border-[#2e2e2e] text-[#a0a0a0] flex-shrink-0 font-mono font-semibold text-[10px]',
        className
      )}
      style={style}
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}
