import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="py-32 text-center max-w-lg mx-auto px-6">
      <h1 className="text-8xl font-serif font-light text-neutral-300">404</h1>
      <h2 className="text-2xl font-serif mt-6 uppercase tracking-wider text-text-custom">Page Not Found</h2>
      <p className="mt-4 text-xs font-sans text-neutral-500 leading-relaxed uppercase tracking-widest">
        The archive or couture collection you are searching for is unavailable.
      </p>
      <div className="mt-10">
        <Link to="/" className="btn-luxury">
          Return to Studio Home
        </Link>
      </div>
    </div>
  );
}
