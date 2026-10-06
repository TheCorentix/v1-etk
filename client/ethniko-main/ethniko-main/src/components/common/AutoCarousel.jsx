import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// How long auto-scroll stays paused after the visitor touches / scrolls the row.
const RESUME_DELAY_MS = 2500;

const EDGE_FADE =
  'linear-gradient(to right, transparent 0, #000 5%, #000 95%, transparent 100%)';

/**
 * Endlessly auto-scrolling horizontal row.
 *
 * - Drifts left continuously; pauses on hover / touch / wheel and resumes after a moment.
 * - Can still be dragged, swiped or scrolled by hand, and loops in both directions.
 * - Rows with at least `minLoopItems` cards repeat them to fill the width and keep moving;
 *   rows with fewer cards (e.g. a single review) stay still and centred.
 * - Honors prefers-reduced-motion (no auto-scroll, manual scrolling still works).
 *
 * Children should be the cards, each with a fixed width.
 */
export default function AutoCarousel({
  children,
  speed = 40, // px per second
  gap = 20, // px between cards
  arrows = true,
  minLoopItems = 3,
  arrowTone = 'light', // 'light' arrows for cream backgrounds, 'dark' for black ones
  label = 'Carousel',
  className = '',
}) {
  const items = React.Children.toArray(children);
  const scrollerRef = useRef(null);
  const setRef = useRef(null);
  const [loopable, setLoopable] = useState(false);
  const [reps, setReps] = useState(1); // how many times the cards repeat inside one set
  const repsRef = useRef(1);
  const live = useRef({ hover: false, lastInteraction: 0, pos: 0 });

  // Decide whether to loop, and how many times the cards must repeat so one set is wider
  // than the visible row (needed for seamless wrapping).
  useEffect(() => {
    const scroller = scrollerRef.current;
    const set = setRef.current;
    if (!scroller || !set) return undefined;
    const measure = () => {
      const unit = set.offsetWidth / repsRef.current; // width of one pass over the cards
      const view = scroller.clientWidth;
      if (!unit || !view) return;
      const loop = unit > view + 1 || items.length >= minLoopItems;
      const needed = loop ? Math.max(1, Math.ceil((view + 1) / unit)) : 1;
      repsRef.current = needed;
      setReps(needed);
      setLoopable(loop);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    observer.observe(set);
    return () => observer.disconnect();
  }, [items.length, minLoopItems]);

  // One full set of cards: the cards repeated `reps` times.
  const repeated = Array.from({ length: reps }, (_, r) =>
    items.map((item) => React.cloneElement(item, { key: `${item.key}-r${r}` }))
  ).flat();

  // Drive the auto-scroll. Content repeats every `set.offsetWidth` px, so wrapping is seamless.
  useEffect(() => {
    if (!loopable) return undefined;
    const scroller = scrollerRef.current;
    const set = setRef.current;
    const state = live.current;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Start one full set in so the visitor can also drag left right away.
    scroller.scrollLeft = set.offsetWidth;
    state.pos = scroller.scrollLeft;

    let frame;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(now - last, 64);
      last = now;
      const width = set.offsetWidth;
      const paused =
        reduceMotion ||
        state.hover ||
        document.hidden ||
        now - state.lastInteraction < RESUME_DELAY_MS;
      if (paused) {
        state.pos = scroller.scrollLeft; // pick up wherever the visitor left it
      } else if (width) {
        state.pos += (speed * dt) / 1000;
        if (state.pos >= width + 2) state.pos -= width;
        scroller.scrollLeft = state.pos;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [loopable, speed]);

  // Manual scrolling past either end jumps by one (identical) set so it never runs out.
  const handleScroll = useCallback(() => {
    if (!loopable) return;
    const scroller = scrollerRef.current;
    const width = setRef.current.offsetWidth;
    if (scroller.scrollLeft <= 0) scroller.scrollLeft += width;
    else if (scroller.scrollLeft >= width + 2) scroller.scrollLeft -= width;
  }, [loopable]);

  const touch = () => {
    live.current.lastInteraction = performance.now();
  };

  const nudge = (direction) => {
    const scroller = scrollerRef.current;
    touch();
    scroller.scrollBy({
      left: direction * Math.max(240, scroller.clientWidth * 0.8),
      behavior: 'smooth',
    });
  };

  const arrowClass =
    arrowTone === 'dark'
      ? 'bg-[#181818]/80 border-[#B68D40]/60 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#181818]'
      : 'bg-white/90 border-[#E6DCCF] text-[#181818] hover:bg-[#181818] hover:text-[#D4AF37]';

  return (
    <div
      className={`group/carousel relative ${className}`}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        onPointerEnter={(e) => { if (e.pointerType === 'mouse') live.current.hover = true; }}
        onPointerLeave={() => { live.current.hover = false; }}
        onPointerDown={touch}
        onTouchStart={touch}
        onTouchMove={touch}
        onTouchEnd={touch}
        onWheel={touch}
        className={`hide-scrollbar flex overflow-x-auto ${loopable ? '' : 'justify-center'}`}
        style={loopable ? { WebkitMaskImage: EDGE_FADE, maskImage: EDGE_FADE } : undefined}
      >
        <div ref={setRef} className="flex shrink-0" style={{ gap, paddingRight: gap }}>
          {repeated}
        </div>
        {loopable && (
          <div className="flex shrink-0" style={{ gap, paddingRight: gap }} aria-hidden="true">
            {repeated.map((item) => React.cloneElement(item, { key: `${item.key}-copy` }))}
          </div>
        )}
      </div>

      {loopable && arrows && (
        <>
          <button
            type="button"
            onClick={() => nudge(-1)}
            aria-label={`${label}: previous`}
            className={`hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full border shadow-md opacity-0 group-hover/carousel:opacity-100 focus-visible:opacity-100 transition-all duration-300 ${arrowClass}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => nudge(1)}
            aria-label={`${label}: next`}
            className={`hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full border shadow-md opacity-0 group-hover/carousel:opacity-100 focus-visible:opacity-100 transition-all duration-300 ${arrowClass}`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
}
