
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
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  const [inputValue, setInputValue] = useState(value.toFixed(1));

  const effectiveStep = 0.1;
  const totalTicks = useMemo(() => Math.round((max - min) / effectiveStep), [min, max, effectiveStep]);
  const rulerWidth = useMemo(() => totalTicks * TICK_WIDTH, [totalTicks]);

  useEffect(() => {
    if (!isDragging.current) {
        setInputValue(value.toFixed(1));
    }
  }, [value]);

  useEffect(() => {
    const ruler = rulerRef.current;
    if (!ruler || isDragging.current) return;

    const center = ruler.clientWidth / 2;
    const scrollPosition = ((value - min) / effectiveStep) * TICK_WIDTH - center;
    
    if (Math.abs(ruler.scrollLeft - scrollPosition) > 1) {
        ruler.scrollTo({
          left: scrollPosition,
          behavior: 'smooth' 
        });
    }
  }, [value, min, effectiveStep]);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    isDragging.current = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    startX.current = clientX;
    scrollLeftStart.current = rulerRef.current?.scrollLeft ?? 0;
    if (rulerRef.current) {
      rulerRef.current.style.cursor = 'grabbing';
      rulerRef.current.style.scrollBehavior = 'auto';
    }
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging.current || !rulerRef.current) return;
    e.preventDefault();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const walk = clientX - startX.current;
    const newScrollLeft = scrollLeftStart.current - walk;
    rulerRef.current.scrollLeft = newScrollLeft;
    
    const center = rulerRef.current.clientWidth / 2;
    const rawValue = ((newScrollLeft + center) / TICK_WIDTH) * effectiveStep + min;
    const snappedValue = Math.round(rawValue / effectiveStep) * effectiveStep;
    const clampedValue = Math.max(min, Math.min(max, snappedValue));
    const finalValue = parseFloat(clampedValue.toFixed(1));

    onChange(finalValue);
  };

  const handleDragEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (rulerRef.current) {
      rulerRef.current.style.cursor = 'grab';
      rulerRef.current.style.scrollBehavior = 'smooth';
    }
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    let newValue = parseFloat(inputValue);
    if (isNaN(newValue)) {
        newValue = min;
    }
    const clampedValue = Math.max(min, Math.min(max, newValue));
    onChange(clampedValue);
    setInputValue(clampedValue.toFixed(1));
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
    <div className={cn('relative w-full flex flex-col items-center justify-center gap-4', className)}>
      <div className="flex items-center gap-2">
        <Input 
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          className="w-24 text-center text-lg font-bold text-primary"
        />
        <span className="text-lg font-bold text-primary">{unit}</span>
      </div>
      <div className="relative w-full h-24 flex items-center justify-center">
         <div className="absolute top-1/2 -translate-y-[calc(50%+12px)] left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-10 pointer-events-none">
             <div className="relative flex items-center justify-center">
              <div className="absolute w-4 h-4 rounded-full bg-primary/20 animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-primary z-10" />
            </div>
            <div className="w-px h-6 bg-primary" />
        </div>
        <div
          ref={rulerRef}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
          className="w-full overflow-x-scroll cursor-grab hide-scrollbar"
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
        /* For browsers that support number input spinners */
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        input[type=number] {
          -moz-appearance: textfield; /* Firefox */
        }
      `}</style>
    </div>
  );
}
