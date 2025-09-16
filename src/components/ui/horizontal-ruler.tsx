
'use client';

import { useRef, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface HorizontalRulerProps {
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  className?: string;
}

const TICK_WIDTH = 10; // width between each small tick
const MAJOR_TICK_EVERY = 10; // 10 small ticks form a major tick

export function HorizontalRuler({
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  unit = '',
  className,
}: HorizontalRulerProps) {
  const rulerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  
  const effectiveStep = unit === 'inch' ? 0.1 : 0.1; // Allow decimals for both
  const totalTicks = useMemo(() => Math.round((max - min) / effectiveStep), [min, max, effectiveStep]);
  const rulerWidth = useMemo(() => totalTicks * TICK_WIDTH, [totalTicks]);

  useEffect(() => {
    const ruler = rulerRef.current;
    if (!ruler) return;

    // Center the initial value
    const center = ruler.clientWidth / 2;
    const scrollPosition = ((value - min) / effectiveStep) * TICK_WIDTH - center;
    
    // Use a timeout to avoid scrolling issues on initial render
    setTimeout(() => {
       ruler.scrollLeft = scrollPosition;
    }, 0);

  }, [value, min, effectiveStep]);
  
  const handleScroll = () => {
    if (isDragging.current || !rulerRef.current) return;
    
    const center = rulerRef.current.clientWidth / 2;
    const scrollLeft = rulerRef.current.scrollLeft;
    
    const rawValue = ((scrollLeft + center) / TICK_WIDTH) * effectiveStep + min;
    const snappedValue = Math.round(rawValue / effectiveStep) * effectiveStep;
    const clampedValue = Math.max(min, Math.min(max, snappedValue));
    
    const finalValue = parseFloat(clampedValue.toFixed(1));

    if (finalValue !== value) {
       onChange(finalValue);
    }
  };

  const renderTicks = () => {
    const ticks = [];
    for (let i = 0; i <= totalTicks; i++) {
      const isMajorTick = i % MAJOR_TICK_EVERY === 0;
      const isHalfTick = i % (MAJOR_TICK_EVERY / 2) === 0;
      const tickValue = parseFloat((min + i * effectiveStep).toFixed(1));

      ticks.push(
        <div
          key={i}
          className="flex flex-col items-center"
          style={{ width: `${TICK_WIDTH}px` }}
        >
          <div
            className={cn(
              'bg-ruler',
              isMajorTick ? 'h-6 w-0.5' : isHalfTick ? 'h-4 w-px' : 'h-2 w-px'
            )}
          />
          {isMajorTick && (
            <span className="mt-2 text-xs text-muted-foreground">{tickValue}</span>
          )}
        </div>
      );
    }
    return ticks;
  };
  
  return (
    <div className={cn('relative w-full h-24 flex items-center justify-center', className)}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-primary" />
      <div
        ref={rulerRef}
        onScroll={handleScroll}
        className="w-full overflow-x-scroll scroll-smooth snap-x snap-mandatory hide-scrollbar"
      >
        <div className="flex items-start" style={{ width: `${rulerWidth}px`, padding: `0 calc(50% - ${TICK_WIDTH/2}px)` }}>
          {renderTicks()}
        </div>
      </div>
      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari and Opera */
        }
      `}</style>
    </div>
  );
}
