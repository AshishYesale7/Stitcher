
'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Image from 'next/image';

type Measurement = 'Shoulder' | 'Chest' | 'Waist' | 'Hips' | 'Inseam' | 'Sleeve';

type MeasurementData = {
    [key in Measurement]: number;
};

type MeasurementPoint = {
  name: Measurement;
  top: string;
  left: string;
};

const points: MeasurementPoint[] = [
  { name: 'Shoulder', top: '19%', left: '25%' },
  { name: 'Chest', top: '28%', left: '70%' },
  { name: 'Waist', top: '42%', left: '25%' },
  { name: 'Hips', top: '55%', left: '70%' },
  { name: 'Inseam', top: '75%', left: '28%' },
  { name: 'Sleeve', top: '35%', left: '5%' },
];

export default function MeasurementCard({ 
    measurements, 
    onMeasurementChange 
}: { 
    measurements: MeasurementData,
    onMeasurementChange: (field: Measurement, value: number) => void;
}) {
  const [selectedMeasurement, setSelectedMeasurement] = useState<Measurement | null>(null);

  const handleSliderChange = (value: number[]) => {
    if (selectedMeasurement) {
      onMeasurementChange(selectedMeasurement, value[0]);
    }
  };

  return (
    <div className="relative w-full max-w-sm mx-auto aspect-[3/4]">
      <Image
        src="https://i.imgur.com/k4dM9iV.png"
        alt="Tailor's dummy"
        width={300}
        height={400}
        className="w-full h-auto"
        priority
      />

      {points.map((point) => (
        <Sheet key={point.name} onOpenChange={(isOpen) => !isOpen && setSelectedMeasurement(null)}>
          <SheetTrigger
            asChild
            onClick={() => setSelectedMeasurement(point.name)}
            style={{ top: point.top, left: point.left }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
          >
            <div
              className={`flex items-center justify-center p-2 rounded-lg cursor-pointer transition-all ${
                selectedMeasurement === point.name
                  ? 'bg-primary text-primary-foreground shadow-lg scale-110'
                  : 'bg-background/80 backdrop-blur-sm border shadow-md'
              }`}
            >
              <div className="text-xs font-semibold">{point.name}</div>
              <div className="text-xs ml-2 font-bold">{measurements[point.name]} cm</div>
            </div>
          </SheetTrigger>
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>Set {selectedMeasurement} Measurement</SheetTitle>
            </SheetHeader>
            <div className="py-8">
              <div className="flex justify-between items-center mb-4">
                <Label htmlFor="measurement-slider" className="text-lg">{selectedMeasurement}</Label>
                <span className="text-lg font-bold text-primary">{measurements[selectedMeasurement!]} cm</span>
              </div>
              <Slider
                id="measurement-slider"
                min={50}
                max={150}
                step={1}
                value={[measurements[selectedMeasurement!]]}
                onValueChange={handleSliderChange}
              />
            </div>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  );
}
