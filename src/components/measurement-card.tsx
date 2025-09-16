
'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import Image from 'next/image';
import { Label } from '@/components/ui/label';

type Measurement = 'Shoulder' | 'Chest' | 'Waist' | 'Hips' | 'Inseam' | 'Sleeve';
type MeasurementUnit = 'cm' | 'inch';

type MeasurementData = {
    [key in Measurement]: number;
};

type MeasurementPoint = {
  name: Measurement;
  imageUrl: string; 
};

// We can update these URLs later as you provide them
const points: MeasurementPoint[] = [
  { name: 'Shoulder', imageUrl: "https://cdn.shopify.com/s/files/1/1540/9157/files/size_picture_large.png?v=1534362322" },
  { name: 'Chest', imageUrl: "https://i.imgur.com/aGv43aP.png" },
  { name: 'Waist', imageUrl: "https://i.imgur.com/JbocJ7d.png" },
  { name: 'Hips', imageUrl: "https://i.imgur.com/Am15c0a.png" },
  { name: 'Inseam', imageUrl: "https://i.imgur.com/kS9o2d1.png" },
  { name: 'Sleeve', imageUrl: "https://i.imgur.com/YwDX6kL.png" },
];

const leftPoints: Measurement[] = ['Shoulder', 'Waist', 'Inseam'];
const rightPoints: Measurement[] = ['Chest', 'Hips', 'Sleeve'];

export default function MeasurementCard({ 
    measurements, 
    onMeasurementChange,
    unit = 'cm'
}: { 
    measurements: MeasurementData,
    onMeasurementChange: (field: Measurement, value: number) => void;
    unit: MeasurementUnit;
}) {
  const [selectedMeasurement, setSelectedMeasurement] = useState<Measurement | null>(null);

  const handleSliderChange = (value: number[]) => {
    if (selectedMeasurement) {
      onMeasurementChange(selectedMeasurement, value[0]);
    }
  };

  const getSliderMinMax = () => {
      const isCm = unit === 'cm';
      return {
          min: isCm ? 20 : 8,
          max: isCm ? 200 : 80
      }
  }

  const selectedImageUrl = points.find(p => p.name === selectedMeasurement)?.imageUrl || "https://i.pinimg.com/736x/2d/07/2f/2d072f7858370dbb0ff1703d8e3c75f7.jpg";
  
  const renderMeasurementButton = (pointName: Measurement) => (
      <Sheet key={pointName} onOpenChange={(isOpen) => !isOpen && setSelectedMeasurement(null)}>
          <SheetTrigger
            asChild
            onClick={() => setSelectedMeasurement(pointName)}
          >
            <div
              className={`flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer transition-all ${
                selectedMeasurement === pointName
                  ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                  : 'bg-background/80 backdrop-blur-sm border shadow-md'
              }`}
            >
              <div className="text-xs font-semibold">{pointName}</div>
              <div className="text-xs font-bold">{measurements[pointName]} {unit}</div>
            </div>
          </SheetTrigger>
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>Set {selectedMeasurement} Measurement</SheetTitle>
            </SheetHeader>
            <div className="py-8">
              <div className="flex justify-between items-center mb-4">
                <Label htmlFor="measurement-slider" className="text-lg">{selectedMeasurement}</Label>
                <span className="text-lg font-bold text-primary">{measurements[selectedMeasurement!]} {unit}</span>
              </div>
              <Slider
                id="measurement-slider"
                min={getSliderMinMax().min}
                max={getSliderMinMax().max}
                step={unit === 'cm' ? 1 : 0.1}
                value={[measurements[selectedMeasurement!]]}
                onValueChange={handleSliderChange}
              />
            </div>
          </SheetContent>
        </Sheet>
  );

  return (
    <div className="grid grid-cols-5 gap-4 items-center">
      {/* Left Column */}
      <div className="col-span-1 flex flex-col space-y-8 relative z-10">
        {leftPoints.map(renderMeasurementButton)}
      </div>

      {/* Center Image */}
      <div className="col-span-3 relative aspect-[3/4]">
        <Image
          src={selectedImageUrl}
          alt="Tailor's dummy"
          fill
          className="object-contain rounded-lg"
          priority
        />
      </div>

      {/* Right Column */}
      <div className="col-span-1 flex flex-col space-y-8 relative z-10">
        {rightPoints.map(renderMeasurementButton)}
      </div>
    </div>
  );
}
    
