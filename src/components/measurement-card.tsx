
'use client';

import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Image from 'next/image';
import { HorizontalRuler } from '@/components/ui/horizontal-ruler';

type Measurement = 'Shoulder' | 'Chest' | 'Waist' | 'Hips' | 'Inseam' | 'Sleeve';

type MeasurementData = {
    [key in Measurement]: number;
};

type MeasurementPoint = {
  name: Measurement;
  imageUrl: string; 
};

type MeasurementCardProps = {
    measurements: MeasurementData;
    onMeasurementChange: (field: Measurement, value: number) => void;
    unit: 'cm' | 'inch';
};

const points: MeasurementPoint[] = [
  { name: 'Shoulder', imageUrl: "https://cdn.shopify.com/s/files/1/1540/9157/files/size_picture_large.png?v=1534362322" },
  { name: 'Waist', imageUrl: "https://i.imgur.com/JbocJ7d.png" },
  { name: 'Chest', imageUrl: "https://i.imgur.com/aGv43aP.png" },
  { name: 'Hips', imageUrl: "https://i.imgur.com/Am15c0a.png" },
  { name: 'Inseam', imageUrl: "https://i.imgur.com/kS9o2d1.png" },
  { name: 'Sleeve', imageUrl: "https://i.imgur.com/YwDX6kL.png" },
];

const leftPoints: Measurement[] = ['Shoulder', 'Chest', 'Inseam'];
const rightPoints: Measurement[] = ['Waist', 'Hips', 'Sleeve'];

export default function MeasurementCard({ 
    measurements,
    onMeasurementChange,
    unit
}: MeasurementCardProps) {
  const [selectedMeasurement, setSelectedMeasurement] = useState<Measurement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedMeasurement(null);
    }
  }, [isOpen]);

  const handleValueChange = (value: number) => {
    if (selectedMeasurement) {
      onMeasurementChange(selectedMeasurement, value);
    }
  };
  
  const getSliderMinMax = () => {
      const isCm = unit === 'cm';
      return {
          min: 0,
          max: isCm ? 200 : 80
      }
  }

  const selectedImageUrl = points.find(p => p.name === selectedMeasurement)?.imageUrl || "https://i.pinimg.com/736x/2d/07/2f/2d072f7858370dbb0ff1703d8e3c75f7.jpg";
  
  const renderMeasurementButton = (pointName: Measurement) => (
      <Sheet key={pointName} open={selectedMeasurement === pointName && isOpen} onOpenChange={(open) => { setIsOpen(open); if (open) setSelectedMeasurement(pointName)}}>
          <SheetTrigger asChild>
            <div
              className={`flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer transition-all ${
                selectedMeasurement === pointName
                  ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                  : 'bg-background/80 backdrop-blur-sm border shadow-md'
              }`}
            >
              <div className="text-xs font-semibold">{pointName}</div>
              <div className="text-xs font-bold">{measurements[pointName]?.toFixed(1) ?? '0.0'} {unit}</div>
            </div>
          </SheetTrigger>
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>Set {selectedMeasurement} Measurement</SheetTitle>
            </SheetHeader>
            <div className="py-8">
              <HorizontalRuler
                min={getSliderMinMax().min}
                max={getSliderMinMax().max}
                value={measurements[selectedMeasurement!] ?? 0}
                onChange={handleValueChange}
                unit={unit}
              />
            </div>
          </SheetContent>
        </Sheet>
  );

  return (
    <div className="flex items-center justify-center w-full gap-4">
        {/* Left Column */}
        <div className="flex flex-col space-y-8">
            {leftPoints.map(renderMeasurementButton)}
        </div>

        {/* Center Image */}
        <div className="relative w-40 h-80">
            <Image
            src={selectedImageUrl}
            alt="Tailor's dummy"
            fill
            className="object-contain rounded-lg"
            priority
            />
        </div>

        {/* Right Column */}
        <div className="flex flex-col space-y-8">
            {rightPoints.map(renderMeasurementButton)}
        </div>
    </div>
  );
}

    