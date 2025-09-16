
'use client';

import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Image from 'next/image';
import { HorizontalRuler } from '@/components/ui/horizontal-ruler';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

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
    unit = 'cm',
    onUnitChange,
    onBack,
    onFinish,
    isSaving,
}: { 
    measurements: MeasurementData,
    onMeasurementChange: (field: Measurement, value: number) => void;
    unit: MeasurementUnit;
    onUnitChange: (unit: MeasurementUnit) => void;
    onBack: () => void;
    onFinish: () => void;
    isSaving: boolean;
}) {
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
      // Based on common human measurements, starting from 0
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
              onClick={() => setSelectedMeasurement(pointName)}
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
    <Card className="w-full max-w-md mx-auto flex flex-col min-h-[600px]">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Body Measurements</CardTitle>
            <CardDescription>Tap on a label to adjust.</CardDescription>
          </div>
          <RadioGroup
            value={unit}
            onValueChange={(val) => onUnitChange(val as MeasurementUnit)}
            className="flex items-center space-x-2"
          >
            <div className="flex items-center space-x-1 space-y-0">
              <RadioGroupItem value="cm" id="cm" />
              <label htmlFor="cm" className="font-normal text-xs">cm</label>
            </div>
            <div className="flex items-center space-x-1 space-y-0">
              <RadioGroupItem value="inch" id="inch" />
              <label htmlFor="inch" className="font-normal text-xs">inch</label>
            </div>
          </RadioGroup>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex items-center">
        <div className="grid grid-cols-5 gap-4 items-center w-full">
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
      </CardContent>
      <CardFooter className="flex justify-between items-center">
          <Button type="button" variant="ghost" onClick={onBack} disabled={isSaving}>Back</Button>
          <p className="text-sm text-muted-foreground">Step 3 of 3</p>
          <Button type="button" onClick={onFinish} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Finish
          </Button>
      </CardFooter>
    </Card>
  );
}
