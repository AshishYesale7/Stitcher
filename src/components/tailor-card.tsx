import Image from 'next/image';
import type { RecommendTailorsOutput } from '@/ai/flows/tailor-recommendation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin } from 'lucide-react';

type Tailor = RecommendTailorsOutput[0];

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
      ))}
      {halfStar && <Star key="half" className="w-4 h-4 text-yellow-400" />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="w-4 h-4 text-muted-foreground/50 fill-muted-foreground/20" />
      ))}
    </div>
  );
}

export default function TailorCard({ tailor }: { tailor: Tailor }) {
  const placeholderImage = `https://picsum.photos/seed/${tailor.tailorId}/100/100`;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 border-2 border-primary/20">
            <AvatarImage src={placeholderImage} alt={tailor.name} data-ai-hint="tailor portrait" />
            <AvatarFallback>{tailor.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="font-headline text-xl">{tailor.name}</CardTitle>
            <CardDescription>{tailor.shopName}</CardDescription>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{tailor.distance} km away</span>
                </div>
                 <div className="flex items-center gap-1">
                    <StarRating rating={tailor.rating} />
                    <span className="font-medium">{tailor.rating.toFixed(1)}</span>
                </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-2">
            <h4 className="text-sm font-semibold">Specialties</h4>
            <div className="flex flex-wrap gap-2">
            {tailor.garmentSpecialties.slice(0, 3).map((specialty) => (
                <Badge key={specialty} variant="secondary">{specialty}</Badge>
            ))}
            </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">View Profile</Button>
      </CardFooter>
    </Card>
  );
}
