import React from 'react';

export default function SkeletonLoader({ count = 4, layout = "grid" }) {
  const items = Array.from({ length: count });

  if (layout === "detail") {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 animate-pulse grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="aspect-[3/4] bg-neutral-200 dark:bg-neutral-800" />
        <div className="space-y-6">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-800 w-1/4" />
          <div className="h-8 bg-neutral-200 dark:bg-neutral-800 w-3/4" />
          <div className="h-6 bg-neutral-200 dark:bg-neutral-800 w-1/3" />
          <div className="space-y-3">
            <div className="h-3.5 bg-neutral-200 dark:bg-neutral-800 w-full" />
            <div className="h-3.5 bg-neutral-200 dark:bg-neutral-800 w-full" />
            <div className="h-3.5 bg-neutral-200 dark:bg-neutral-800 w-2/3" />
          </div>
          <div className="h-10 bg-neutral-200 dark:bg-neutral-800 w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
      {items.map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="aspect-[3/4] bg-neutral-200 dark:bg-neutral-800" />
          <div className="space-y-2">
            <div className="h-3 bg-neutral-200 dark:bg-neutral-800 w-1/3" />
            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 w-3/4" />
            <div className="h-3 bg-neutral-200 dark:bg-neutral-800 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
