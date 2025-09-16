
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
  { name: 'Shoulder', imageUrl: "https://media.istockphoto.com/id/176992048/photo/a-dressmakers-mannequin-with-a-yellow-tape-measure.jpg?s=612x612&w=0&k=20&c=vksMIhJQdtz2XrVwiqQNyL_Nmz1xBwvF9pMV90xWc60=" },
  { name: 'Chest', imageUrl: "https://media.istockphoto.com/id/176992048/photo/a-dressmakers-mannequin-with-a-yellow-tape-measure.jpg?s=612x612&w=0&k=20&c=vksMIhJQdtz2XrVwiqQNyL_Nmz1xBwvF9pMV90xWc60=" },
  { name: 'Waist', imageUrl: "https://media.istockphoto.com/id/176992048/photo/a-dressmakers-mannequin-with-a-yellow-tape-measure.jpg?s=612x612&w=0&k=20&c=vksMIhJQdtz2XrVwiqQNyL_Nmz1xBwvF9pMV90xWc60=" },
  { name: 'Hips', imageUrl: "https://media.istockphoto.com/id/176992048/photo/a-dressmakers-mannequin-with-a-yellow-tape-measure.jpg?s=612x612&w=0&k=20&c=vksMIhJQdtz2XrVwiqQNyL_Nmz1xBwvF9pMV90xWc60=" },
  { name: 'Inseam', imageUrl: "https://media.istockphoto.com/id/176992048/photo/a-dressmakers-mannequin-with-a-yellow-tape-measure.jpg?s=612x612&w=0&k=20&c=vksMIhJQdtz2XrVwiqQNyL_Nmz1xBwvF9pMV90xWc60=" },
  { name: 'Sleeve', imageUrl: "https://media.istockphoto.com/id/176992048/photo/a-dressmakers-mannequin-with-a-yellow-tape-measure.jpg?s=612x612&w=0&k=20&c=vksMIhJQdtz2XrVwiqQNyL_Nmz1xBwvF9pMV90xWc60=" },
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

  const selectedImageUrl = points.find(p => p.name === selectedMeasurement)?.imageUrl || "https://media.istockphoto.com/id/176992048/photo/a-dressmakers-mannequin-with-a-yellow-tape-measure.jpg?s=612x612&w=0&k=20&c=vksMIhJQdtz2XrVwiqQNyL_Nmz1xBwvF9pMV90xWc60=";
  
  const renderMeasurementButton = (pointName: Measurement) => (
      <Sheet key={pointName} onOpenChange={(isOpen) => !isOpen && setSelectedMeasurement(null)}>
          <SheetTrigger
            asChild
            onClick={() => setSelectedMeasurement(pointName)}
          >
            <div
              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                selectedMeasurement === pointName
                  ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                  : 'bg-background/80 backdrop-blur-sm border shadow-md'
              }`}
            >
              <div className="text-xs font-semibold">{pointName}</div>
              <div className="text-xs ml-2 font-bold">{measurements[pointName]} {unit}</div>
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
      <div className="col-span-1 flex flex-col space-y-8">
        {leftPoints.map(renderMeasurementButton)}
      </div>

      {/* Center Image */}
      <div className="col-span-3 relative aspect-[3/4]">
        <Image
          src={selectedImageUrl}
          alt="Tailor's dummy"
          fill
          className="object-cover rounded-lg"
          priority
        />
      </div>

      {/* Right Column */}
      <div className="col-span-1 flex flex-col space-y-8">
        {rightPoints.map(renderMeasurementButton)}
      </div>
    </div>
  );
}
    
