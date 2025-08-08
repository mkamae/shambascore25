import React from 'react';

export const InstagramIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <rect width="16" height="16" x="4" y="4" stroke="currentColor" strokeWidth="1.5" rx="4" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M16.5 7.5v.001" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);