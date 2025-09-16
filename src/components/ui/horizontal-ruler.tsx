
'use client';

import { useRef, useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Input } from './input';

interface HorizontalRulerProps {
  min?: number;
  max?: number;
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
  value,
  onChange,
  unit = '',
  className,
}: HorizontalRulerProps) {
  const rulerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const [internalValue, setInternalValue] = useState(value);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const effectiveStep = 0.1;
  const totalTicks = useMemo(() => Math.round((max - min) / effectiveStep), [min, max, effectiveStep]);
  const rulerWidth = useMemo(() => totalTicks * TICK_WIDTH, [totalTicks]);

  useEffect(() => {
    // Only update if the parent's value is significantly different
    if (Math.abs(value - internalValue) > 0.01) {
        setInternalValue(value);
    }
  }, [value, internalValue]);
  
  useEffect(() => {
    const ruler = rulerRef.current;
    if (!ruler || typeof internalValue !== 'number') return;
  
    const center = ruler.clientWidth / 2;
    const scrollPosition = ((internalValue - min) / effectiveStep) * TICK_WIDTH - center;
    
    ruler.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });
  
  }, [internalValue, min, effectiveStep]);

  const handleScroll = () => {
    if (isDragging.current) return;

    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    
    scrollTimeout.current = setTimeout(() => {
      if (!rulerRef.current) return; // Add check here
      const center = rulerRef.current.clientWidth / 2;
      const scrollLeft = rulerRef.current.scrollLeft;
      
      const rawValue = ((scrollLeft + center) / TICK_WIDTH) * effectiveStep + min;
      const snappedValue = Math.round(rawValue / effectiveStep) * effectiveStep;
      const clampedValue = Math.max(min, Math.min(max, snappedValue));
      
      const finalValue = parseFloat(clampedValue.toFixed(1));
  
      if (finalValue !== value) {
         onChange(finalValue);
         setInternalValue(finalValue);
      }
    }, 150); 
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value);
      if (!isNaN(newValue)) {
        setInternalValue(newValue); // Update internal state for typing
        if (newValue >= min && newValue <= max) {
            onChange(newValue); // Propagate change if valid
        }
      } else {
        setInternalValue(0); // Handle empty input
      }
  }

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
  
  const displayValue = typeof internalValue === 'number' ? internalValue.toFixed(1) : (0).toFixed(1);

  return (
    <div className={cn('relative w-full flex flex-col items-center justify-center gap-4', className)}>
      <div className="flex items-center gap-2">
        <Input 
          type="number"
          value={typeof internalValue === 'number' ? internalValue : ''}
          onChange={handleInputChange}
          className="w-24 text-center text-lg font-bold text-primary"
          step={effectiveStep}
          min={min}
          max={max}
        />
        <span className="text-lg font-bold text-primary">{unit}</span>
      </div>
      <div className="relative w-full h-24 flex items-center justify-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-primary" />
        <div
          ref={rulerRef}
          onScroll={handleScroll}
          onMouseDown={() => { isDragging.current = true; }}
          onMouseUp={() => { 
            isDragging.current = false;
            handleScroll();
          }}
          onTouchStart={() => { isDragging.current = true; }}
          onTouchEnd={() => {
            isDragging.current = false;
            handleScroll();
          }}
          className="w-full overflow-x-scroll cursor-grab active:cursor-grabbing hide-scrollbar"
        >
          <div className="flex items-start" style={{ width: `${rulerWidth}px`, padding: `0 calc(50% - ${TICK_WIDTH/2}px)` }}>
            {renderTicks()}
          </div>
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
