'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect } from 'react';
import { getTailorRecommendations, type FormState } from '@/app/actions/recommendations';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TailorCard from './tailor-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const initialState: FormState = {
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
      Find Tailors
    </Button>
  );
}

export default function FindTailorView() {
  const [state, formAction] = useFormState(getTailorRecommendations, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message && state.message !== 'Successfully found recommendations.' && state.message !== 'No tailors found matching your criteria.') {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <Card>
          <CardContent className="pt-6">
            <form action={formAction} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="garmentType">Garment Type</Label>
                <Select name="garmentType" required>
                  <SelectTrigger id="garmentType">
                    <SelectValue placeholder="Select a garment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Shirt">Shirt</SelectItem>
                    <SelectItem value="Pants">Pants</SelectItem>
                    <SelectItem value="Kurta">Kurta</SelectItem>
                    <SelectItem value="Saree">Saree</SelectItem>
                    <SelectItem value="Blouse">Blouse</SelectItem>
                    <SelectItem value="Dress">Dress</SelectItem>
                  </SelectContent>
                </Select>
                 {state.errors?.garmentType && <p className="text-sm font-medium text-destructive">{state.errors.garmentType[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="designDetails">Design Details</Label>
                <Textarea id="designDetails" name="designDetails" placeholder="e.g., silk fabric, mandarin collar, embroidery" required />
                {state.errors?.designDetails && <p className="text-sm font-medium text-destructive">{state.errors.designDetails[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerLocation">Your Location</Label>
                <Input id="customerLocation" name="customerLocation" placeholder="e.g., New York, NY" required />
                {state.errors?.customerLocation && <p className="text-sm font-medium text-destructive">{state.errors.customerLocation[0]}</p>}
              </div>
              <SubmitButton />
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        {state.data ? (
          state.data.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold font-headline">Recommended Tailors</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {state.data.map((tailor) => (
                  <TailorCard key={tailor.tailorId} tailor={tailor} />
                ))}
              </div>
            </div>
          ) : (
             <Alert>
              <AlertTitle>No Tailors Found</AlertTitle>
              <AlertDescription>
                We couldn't find any tailors matching your criteria. Try broadening your search.
              </AlertDescription>
            </Alert>
          )
        ) : (
           <Alert>
            <AlertTitle>Let's Find Your Tailor</AlertTitle>
            <AlertDescription>
              Fill out the form to the left to see personalized tailor recommendations.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
