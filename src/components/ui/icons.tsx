
import React from "react";

export const FilterX = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M4.18 4.18 15.82 15.82" />
    <path d="m19.82 19.82-4-4" />
    <path d="M15.82 15.82 21 21" />
    <path d="m4.18 4.18-1.18 1.2" />
    <path d="M2.5 8.5h3" />
    <path d="M2.5 15.5h3" />
    <path d="M3 12h9" />
    <path d="M18.5 8.5h3" />
    <path d="M18.5 15.5h3" />
    <path d="m9 3 1 5.5" />
    <path d="m15 3-1 5.5" />
  </svg>
);

export const Loader2 = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="animate-spin"
    {...props}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
