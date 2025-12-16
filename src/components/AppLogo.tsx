import React from 'react';
import { ASSETS } from '../lib/utils';

export const AppLogo = ({ size = 12 }: { size?: number }) => (
  <div 
    className="relative overflow-hidden rounded-full border-4 border-white bg-white shadow-xl transition-transform hover:scale-105" 
    style={{ width: `${size*4}px`, height: `${size*4}px` }}
  >
    <img 
      src={ASSETS.LOGO_URL}
      alt="Logo" 
      className="h-full w-full object-cover"
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = 'none';
        (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="flex h-full w-full items-center justify-center bg-blue-600 text-white font-bold text-2xl">T</div>';
      }}
    />
  </div>
);