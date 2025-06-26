import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ion-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { name: string; class?: string; src?: string; icon?: string; size?: string; }, HTMLElement>;
    }
  }
}

export {}; // Ensures this file is treated as a module
