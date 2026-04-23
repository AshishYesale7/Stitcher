'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { getAllTailors, createOrder, createConversation, type TailorProfile } from '@/lib/firestore-helpers';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Loader2, Star, MapPin, ChevronRight, ChevronLeft, Check,
  Scissors, Shirt, Ruler, Calculator, MessageCircle, ShoppingBag,
  Palette, Sparkles, Eye, Phone, Clock, Award, ThumbsUp,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

// ─── Data ────────────────────────────────────────────────────────────────────

const FABRICS = [
  { id: 'cotton', name: 'Cotton', pricePerMeter: 250, description: 'Breathable, comfortable for daily wear', icon: '🧶' },
  { id: 'silk', name: 'Silk', pricePerMeter: 800, description: 'Luxurious, smooth, ideal for occasions', icon: '✨' },
  { id: 'linen', name: 'Linen', pricePerMeter: 400, description: 'Lightweight, perfect for summer', icon: '🌿' },
  { id: 'polyester', name: 'Polyester', pricePerMeter: 180, description: 'Durable, wrinkle-resistant', icon: '🔷' },
  { id: 'wool', name: 'Wool', pricePerMeter: 600, description: 'Warm, premium feel for suits', icon: '🐑' },
  { id: 'chiffon', name: 'Chiffon', pricePerMeter: 350, description: 'Sheer, elegant drape for sarees', icon: '🎀' },
  { id: 'velvet', name: 'Velvet', pricePerMeter: 700, description: 'Rich texture, royal appearance', icon: '👑' },
  { id: 'denim', name: 'Denim', pricePerMeter: 300, description: 'Rugged, casual, long-lasting', icon: '👖' },
];

const GARMENT_STYLES = [
  { id: 'shirt', name: 'Shirt', fabricMeters: 2.5, laborCost: 500, icon: '👔', description: 'Formal or casual shirt' },
  { id: 'pants', name: 'Pants / Trousers', fabricMeters: 2.0, laborCost: 600, icon: '👖', description: 'Formal or casual trousers' },
  { id: 'kurta', name: 'Kurta', fabricMeters: 3.0, laborCost: 700, icon: '🪷', description: 'Traditional Indian kurta' },
  { id: 'suit', name: 'Full Suit (3-piece)', fabricMeters: 5.0, laborCost: 2500, icon: '🤵', description: 'Blazer + shirt + trousers' },
  { id: 'dress', name: 'Dress', fabricMeters: 3.5, laborCost: 1200, icon: '👗', description: 'Western or fusion dress' },
  { id: 'saree_blouse', name: 'Saree Blouse', fabricMeters: 1.0, laborCost: 800, icon: '🧵', description: 'Designer blouse for sarees' },
  { id: 'sherwani', name: 'Sherwani', fabricMeters: 4.5, laborCost: 3000, icon: '🏰', description: 'Traditional wedding sherwani' },
  { id: 'lehenga', name: 'Lehenga Choli', fabricMeters: 6.0, laborCost: 3500, icon: '💃', description: 'Bridal / festive lehenga set' },
];

// Garment-specific measurement fields per style
type MeasurementField = { key: string; label: string; defaultVal: number; bodyKey?: string };
const GARMENT_MEASUREMENTS: Record<string, MeasurementField[]> = {
  shirt: [
    { key: 'chest', label: 'Chest', defaultVal: 98, bodyKey: 'chest' },
    { key: 'shoulder', label: 'Shoulder Width', defaultVal: 44 },
    { key: 'sleeveLength', label: 'Sleeve Length', defaultVal: 62 },
    { key: 'neck', label: 'Neck', defaultVal: 38 },
    { key: 'shirtLength', label: 'Shirt Length', defaultVal: 72 },
    { key: 'waist', label: 'Waist', defaultVal: 82, bodyKey: 'waist' },
  ],
  pants: [
    { key: 'waist', label: 'Waist', defaultVal: 82, bodyKey: 'waist' },
    { key: 'hips', label: 'Hip', defaultVal: 104, bodyKey: 'hips' },
    { key: 'inseam', label: 'Inseam', defaultVal: 78, bodyKey: 'inseam' },
    { key: 'thigh', label: 'Thigh', defaultVal: 56 },
    { key: 'pantsLength', label: 'Total Length', defaultVal: 102 },
    { key: 'knee', label: 'Knee', defaultVal: 40 },
  ],
  kurta: [
    { key: 'chest', label: 'Chest', defaultVal: 98, bodyKey: 'chest' },
    { key: 'shoulder', label: 'Shoulder Width', defaultVal: 44 },
    { key: 'sleeveLength', label: 'Sleeve Length', defaultVal: 60 },
    { key: 'kurtaLength', label: 'Kurta Length', defaultVal: 95 },
    { key: 'waist', label: 'Waist', defaultVal: 82, bodyKey: 'waist' },
    { key: 'hips', label: 'Hip', defaultVal: 104, bodyKey: 'hips' },
  ],
  suit: [
    { key: 'chest', label: 'Chest', defaultVal: 98, bodyKey: 'chest' },
    { key: 'shoulder', label: 'Shoulder Width', defaultVal: 44 },
    { key: 'sleeveLength', label: 'Sleeve Length', defaultVal: 62 },
    { key: 'waist', label: 'Waist', defaultVal: 82, bodyKey: 'waist' },
    { key: 'hips', label: 'Hip', defaultVal: 104, bodyKey: 'hips' },
    { key: 'inseam', label: 'Inseam (Trousers)', defaultVal: 78, bodyKey: 'inseam' },
    { key: 'jacketLength', label: 'Jacket Length', defaultVal: 72 },
    { key: 'trouserLength', label: 'Trouser Length', defaultVal: 102 },
  ],
  dress: [
    { key: 'bust', label: 'Bust', defaultVal: 90, bodyKey: 'chest' },
    { key: 'waist', label: 'Waist', defaultVal: 72, bodyKey: 'waist' },
    { key: 'hips', label: 'Hip', defaultVal: 98, bodyKey: 'hips' },
    { key: 'shoulder', label: 'Shoulder Width', defaultVal: 38 },
    { key: 'dressLength', label: 'Dress Length', defaultVal: 100 },
    { key: 'sleeveLength', label: 'Sleeve Length', defaultVal: 55 },
  ],
  saree_blouse: [
    { key: 'bust', label: 'Bust', defaultVal: 90, bodyKey: 'chest' },
    { key: 'underbust', label: 'Underbust', defaultVal: 78 },
    { key: 'shoulder', label: 'Shoulder Width', defaultVal: 36 },
    { key: 'sleeveLength', label: 'Sleeve Length', defaultVal: 30 },
    { key: 'blouseLength', label: 'Blouse Length', defaultVal: 38 },
    { key: 'armhole', label: 'Armhole', defaultVal: 42 },
  ],
  sherwani: [
    { key: 'chest', label: 'Chest', defaultVal: 100, bodyKey: 'chest' },
    { key: 'waist', label: 'Waist', defaultVal: 86, bodyKey: 'waist' },
    { key: 'shoulder', label: 'Shoulder Width', defaultVal: 46 },
    { key: 'sherwaniLength', label: 'Sherwani Length', defaultVal: 110 },
    { key: 'sleeveLength', label: 'Sleeve Length', defaultVal: 64 },
    { key: 'neck', label: 'Neck', defaultVal: 40 },
  ],
  lehenga: [
    { key: 'waist', label: 'Waist', defaultVal: 72, bodyKey: 'waist' },
    { key: 'hips', label: 'Hip', defaultVal: 98, bodyKey: 'hips' },
    { key: 'lehengaLength', label: 'Lehenga Length', defaultVal: 100 },
    { key: 'bust', label: 'Bust (Choli)', defaultVal: 90, bodyKey: 'chest' },
    { key: 'choliLength', label: 'Choli Length', defaultVal: 36 },
    { key: 'sleeveLength', label: 'Sleeve Length', defaultVal: 28 },
  ],
};

const STEPS = ['Fabric', 'Style', 'Measurements', 'Cost Summary', 'Find Tailor'];

// ─── Components ──────────────────────────────────────────────────────────────

function StepIndicator({ current, steps }: { current: number; steps: string[] }) {
  return (
    <div className="flex items-center justify-center gap-1 mb-8">
      {steps.map((step, idx) => (
        <div key={step} className="flex items-center">
          <div className={cn(
            'flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all',
            idx < current ? 'bg-emerald-500 text-white' :
            idx === current ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' :
            'bg-muted text-muted-foreground'
          )}>
            {idx < current ? <Check className="w-4 h-4" /> : idx + 1}
          </div>
          <span className={cn('text-xs ml-1.5 hidden sm:inline', idx === current ? 'text-primary font-semibold' : 'text-muted-foreground')}>
            {step}
          </span>
          {idx < steps.length - 1 && <div className={cn('w-6 sm:w-10 h-0.5 mx-2', idx < current ? 'bg-emerald-500' : 'bg-muted')} />}
        </div>
      ))}
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/20'}`} />
      ))}
      <span className="ml-1 text-xs font-semibold">{rating.toFixed(1)}</span>
    </div>
  );
}

// Demo reviews for profile dialog
const DEMO_REVIEWS = [
  { name: 'Priya S.', rating: 5, date: '2 weeks ago', text: 'Absolutely amazing work! The stitching quality is impeccable.' },
  { name: 'Rahul M.', rating: 4, date: '1 month ago', text: 'Great fit and finish. Very professional. Will order again.' },
  { name: 'Anita K.', rating: 5, date: '1 month ago', text: 'Beautiful embroidery work on my lehenga. Exceeded expectations!' },
  { name: 'Vikash P.', rating: 4, date: '2 months ago', text: 'Good quality stitching. The suit fits perfectly.' },
  { name: 'Sneha D.', rating: 3, date: '3 months ago', text: 'Decent work. Delivery was slightly delayed but quality was okay.' },
];

function TailorProfileViewDialog({ tailor }: { tailor: TailorProfile }) {
  const reviewSeed = tailor.uid.charCodeAt(0) % 3;
  const reviews = DEMO_REVIEWS.slice(reviewSeed, reviewSeed + 3);
  const totalReviews = Math.floor((tailor.rating || 3) * 8 + 12);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs rounded-full gap-1 h-7" onClick={(e) => e.stopPropagation()}>
          <Eye className="h-3 w-3" /> View Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <DialogTitle className="sr-only">{tailor.displayName || 'Tailor'} Profile</DialogTitle>
        {/* Header */}
        <div className="h-20 -mx-6 -mt-6 bg-gradient-to-r from-primary/30 via-purple-500/30 to-blue-500/30 rounded-t-lg" />
        <div className="flex items-end gap-4 -mt-10 mb-2">
          <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
            <AvatarImage src={tailor.photoURL || `https://picsum.photos/seed/${tailor.uid}/200/200`} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">{(tailor.displayName || '?').charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 pb-1">
            <h2 className="text-xl font-bold font-headline truncate">{tailor.displayName || 'Unknown'}</h2>
            <p className="text-sm text-muted-foreground">{tailor.shopName || 'Independent Tailor'}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 my-4">
          <div className="bg-muted/50 rounded-xl p-3 text-center">
            <Star className="h-4 w-4 mx-auto mb-1 text-yellow-500" />
            <p className="text-lg font-bold">{(tailor.rating || 0).toFixed(1)}</p>
            <p className="text-[10px] text-muted-foreground">Rating</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-3 text-center">
            <ThumbsUp className="h-4 w-4 mx-auto mb-1 text-emerald-500" />
            <p className="text-lg font-bold">{totalReviews}</p>
            <p className="text-[10px] text-muted-foreground">Reviews</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-3 text-center">
            <Award className="h-4 w-4 mx-auto mb-1 text-purple-500" />
            <p className="text-lg font-bold">{tailor.specialties?.length || 0}</p>
            <p className="text-[10px] text-muted-foreground">Specialties</p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" />{tailor.location || 'Location not set'}</div>
          {tailor.phoneNumber && <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" />{tailor.phoneNumber}</div>}
          <div className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4 text-muted-foreground" />Typically responds within 1 hour</div>
        </div>

        {tailor.bio && (<><Separator className="my-4" /><div><h3 className="text-sm font-semibold mb-1">About</h3><p className="text-sm text-muted-foreground leading-relaxed">{tailor.bio}</p></div></>)}

        {tailor.specialties?.length > 0 && (<><Separator className="my-4" /><div><h3 className="text-sm font-semibold mb-2">Specialties</h3><div className="flex flex-wrap gap-1.5">{tailor.specialties.map((s) => <Badge key={s} variant="secondary" className="text-xs rounded-full">{s}</Badge>)}</div></div></>)}

        {/* Reviews */}
        <Separator className="my-4" />
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Customer Reviews</h3>
            <span className="text-xs text-muted-foreground">{totalReviews} reviews</span>
          </div>
          <div className="flex items-center gap-4 mb-4 bg-muted/50 rounded-xl p-3">
            <div className="text-center">
              <p className="text-3xl font-bold">{(tailor.rating || 0).toFixed(1)}</p>
              <StarRating rating={tailor.rating || 0} />
            </div>
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const pct = star === 5 ? 65 : star === 4 ? 22 : star === 3 ? 8 : star === 2 ? 3 : 2;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-3 text-muted-foreground">{star}</span>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} /></div>
                    <span className="w-7 text-right text-muted-foreground">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="space-y-3">
            {reviews.map((review, idx) => (
              <div key={idx} className="border rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{review.name.charAt(0)}</div>
                    <span className="text-sm font-medium">{review.name}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{review.date}</span>
                </div>
                <div className="flex gap-0.5 mb-1">{[1,2,3,4,5].map((i) => <Star key={i} className={`w-3 h-3 ${i <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/20'}`} />)}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function DesignGarmentPage() {
  const [step, setStep] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  // Form state
  const [selectedFabric, setSelectedFabric] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [measurementMode, setMeasurementMode] = useState<'saved' | 'inperson'>('saved');
  const [bodyMeasurements, setBodyMeasurements] = useState<Record<string, number>>({});
  const [garmentMeasurements, setGarmentMeasurements] = useState<Record<string, number>>({});
  const [measurementsSaving, setMeasurementsSaving] = useState(false);
  const [customNotes, setCustomNotes] = useState('');
  const [tailors, setTailors] = useState<TailorProfile[]>([]);
  const [selectedTailor, setSelectedTailor] = useState<TailorProfile | null>(null);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Load saved body measurements
        try {
          const snap = await getDoc(doc(db, 'customers', u.uid));
          if (snap.exists()) {
            const data = snap.data();
            const body: Record<string, number> = {};
            for (const key of ['height', 'weight', 'chest', 'waist', 'hips', 'inseam']) {
              if (data[key]) body[key] = data[key];
            }
            setBodyMeasurements(body);
          }
        } catch {}
        // Load tailors
        getAllTailors(u.uid).then(setTailors);
      }
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const fabric = FABRICS.find((f) => f.id === selectedFabric);
  const style = GARMENT_STYLES.find((s) => s.id === selectedStyle);
  const fabricCost = fabric && style ? fabric.pricePerMeter * style.fabricMeters : 0;
  const laborCost = style?.laborCost || 0;
  const totalCost = fabricCost + laborCost;

  // Get garment-specific fields based on selected style
  const measurementFields = selectedStyle ? GARMENT_MEASUREMENTS[selectedStyle] || [] : [];

  // Initialize garment measurements when style changes
  useEffect(() => {
    if (!selectedStyle) return;
    const fields = GARMENT_MEASUREMENTS[selectedStyle] || [];
    const initial: Record<string, number> = {};
    for (const field of fields) {
      // Pre-fill from body measurements if available, else use default
      initial[field.key] = (field.bodyKey && bodyMeasurements[field.bodyKey]) || field.defaultVal;
    }
    setGarmentMeasurements(initial);
  }, [selectedStyle, bodyMeasurements]);

  const handleMeasurementChange = (key: string, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
      setGarmentMeasurements((prev) => ({ ...prev, [key]: num }));
    }
  };

  const saveMeasurementsToFirestore = async () => {
    if (!user || measurementMode !== 'saved') return;
    setMeasurementsSaving(true);
    try {
      await setDoc(doc(db, 'customers', user.uid), {
        [`garmentMeasurements_${selectedStyle}`]: garmentMeasurements,
        updatedAt: new Date(),
      }, { merge: true });
    } catch (e) {
      console.error('Failed to save measurements', e);
    } finally {
      setMeasurementsSaving(false);
    }
  };

  const canProceed = () => {
    if (step === 0) return !!selectedFabric;
    if (step === 1) return !!selectedStyle;
    if (step === 2) return true;
    if (step === 3) return true;
    if (step === 4) return !!selectedTailor;
    return false;
  };

  const handlePlaceOrder = async () => {
    if (!user || !selectedTailor || !fabric || !style) return;
    setPlacing(true);
    try {
      const measurementSummary = measurementMode === 'saved'
        ? Object.entries(garmentMeasurements).map(([k, v]) => `${k}: ${v}cm`).join(', ')
        : 'Will provide in person';
      const designDetails = [
        `Fabric: ${fabric.name} (${style.fabricMeters}m)`,
        `Style: ${style.name}`,
        `Measurements: ${measurementSummary}`,
        customNotes ? `Notes: ${customNotes}` : '',
      ].filter(Boolean).join(' | ');

      await createOrder({
        tailorId: selectedTailor.uid,
        customerId: user.uid,
        customerName: user.displayName || user.phoneNumber || 'Customer',
        customerEmail: user.email || '',
        garmentType: style.name,
        designDetails,
        amount: totalCost,
        notes: customNotes,
      });

      // Also create a conversation
      await createConversation(
        selectedTailor.uid, user.uid,
        selectedTailor.displayName, user.displayName || 'Customer'
      );

      toast({ title: '🎉 Order Placed!', description: `Your ${style.name} order has been sent to ${selectedTailor.displayName}.` });
      router.push('/customer/orders');
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to place order.' });
    } finally {
      setPlacing(false);
    }
  };

  if (isLoading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Custom Design Studio</span>
        </div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Design Your Garment</h1>
        <p className="text-muted-foreground mt-1">Choose fabric, style, and find a tailor — all in one place.</p>
      </div>

      <StepIndicator current={step} steps={STEPS} />

      {/* Step 0: Fabric Selection */}
      {step === 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold font-headline flex items-center gap-2"><Palette className="h-5 w-5 text-primary" /> Select Fabric</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {FABRICS.map((f) => (
              <button key={f.id} onClick={() => setSelectedFabric(f.id)}
                className={cn(
                  'relative p-4 rounded-2xl border text-left transition-all hover:shadow-md',
                  selectedFabric === f.id ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'hover:border-primary/40'
                )}>
                {selectedFabric === f.id && <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center"><Check className="w-3 h-3 text-primary-foreground" /></div>}
                <span className="text-2xl">{f.icon}</span>
                <h3 className="font-semibold mt-2">{f.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{f.description}</p>
                <p className="text-sm font-bold text-primary mt-2">₹{f.pricePerMeter}/m</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Style Selection */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold font-headline flex items-center gap-2"><Shirt className="h-5 w-5 text-primary" /> Choose Garment Style</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GARMENT_STYLES.map((s) => (
              <button key={s.id} onClick={() => setSelectedStyle(s.id)}
                className={cn(
                  'relative flex items-center gap-4 p-4 rounded-2xl border text-left transition-all hover:shadow-md',
                  selectedStyle === s.id ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'hover:border-primary/40'
                )}>
                {selectedStyle === s.id && <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center"><Check className="w-3 h-3 text-primary-foreground" /></div>}
                <span className="text-3xl">{s.icon}</span>
                <div>
                  <h3 className="font-semibold">{s.name}</h3>
                  <p className="text-xs text-muted-foreground">{s.description}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    <span className="text-muted-foreground">Fabric: {s.fabricMeters}m</span>
                    <span className="font-semibold text-primary">Labor: ₹{s.laborCost.toLocaleString()}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Measurements */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold font-headline flex items-center gap-2">
              <Ruler className="h-5 w-5 text-primary" /> Measurements for {style?.name || 'Garment'}
            </h2>
            {style && <Badge variant="secondary" className="rounded-full text-xs gap-1">{style.icon} {style.name}</Badge>}
          </div>

          <RadioGroup value={measurementMode} onValueChange={(v) => setMeasurementMode(v as 'saved' | 'inperson')} className="space-y-3">
            {/* Option 1: Custom / Saved measurements */}
            <label className={cn('block p-4 rounded-2xl border cursor-pointer transition-all',
              measurementMode === 'saved' ? 'border-primary bg-primary/5' : 'hover:border-primary/40')}>
              <div className="flex items-start gap-3">
                <RadioGroupItem value="saved" className="mt-1" />
                <div className="flex-1">
                  <p className="font-semibold">Enter / Edit Measurements</p>
                  <p className="text-sm text-muted-foreground">Pre-filled from your profile · Edit for this garment · Auto-saved</p>
                </div>
              </div>

              {measurementMode === 'saved' && (
                <div className="mt-4 space-y-4">
                  {Object.keys(bodyMeasurements).length > 0 && (
                    <div className="bg-muted/50 rounded-xl p-3">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase mb-2">Your Body Profile (reference)</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(bodyMeasurements).map(([key, val]) => (
                          <span key={key} className="text-xs bg-background rounded-lg px-2 py-1 border">
                            <span className="text-muted-foreground capitalize">{key}:</span> <span className="font-semibold">{val}cm</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {measurementFields.map((field) => {
                      const fromBody = field.bodyKey && bodyMeasurements[field.bodyKey];
                      return (
                        <div key={field.key} className="space-y-1.5">
                          <Label className="text-xs font-medium flex items-center gap-1">
                            {field.label}
                            {fromBody && (
                              <span className="text-[9px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1 rounded">from profile</span>
                            )}
                          </Label>
                          <div className="relative">
                            <Input
                              type="number"
                              value={garmentMeasurements[field.key] || ''}
                              onChange={(e) => handleMeasurementChange(field.key, e.target.value)}
                              className="pr-8 h-9 text-sm"
                              min={1}
                              max={300}
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">cm</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {measurementsSaving && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" /> Saving measurements...
                    </p>
                  )}
                </div>
              )}
            </label>

            {/* Option 2: In person */}
            <label className={cn('block p-4 rounded-2xl border cursor-pointer transition-all',
              measurementMode === 'inperson' ? 'border-primary bg-primary/5' : 'hover:border-primary/40')}>
              <div className="flex items-start gap-3">
                <RadioGroupItem value="inperson" className="mt-1" />
                <div>
                  <p className="font-semibold">Give Measurements In Person</p>
                  <p className="text-sm text-muted-foreground">Visit the tailor shop for precise fitting and measurements</p>
                </div>
              </div>
            </label>
          </RadioGroup>

          <div className="space-y-2">
            <Label>Additional Design Notes</Label>
            <Textarea placeholder="e.g., Add pockets, specific collar style, embroidery details..." value={customNotes} onChange={(e) => setCustomNotes(e.target.value)} className="min-h-[100px]" />
          </div>
        </div>
      )}

      {/* Step 3: Cost Summary */}
      {step === 3 && fabric && style && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold font-headline flex items-center gap-2"><Calculator className="h-5 w-5 text-primary" /> Cost Breakdown</h2>

          <Card className="border rounded-2xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-primary via-purple-500 to-blue-500" />
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{style.icon}</span>
                <div>
                  <h3 className="text-xl font-bold">{style.name}</h3>
                  <p className="text-sm text-muted-foreground">{fabric.name} fabric · {style.fabricMeters}m required</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fabric ({fabric.name} × {style.fabricMeters}m)</span>
                  <span className="font-medium">₹{fabricCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Stitching / Labor ({style.name})</span>
                  <span className="font-medium">₹{laborCost.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg">
                  <span className="font-bold">Total Estimated Cost</span>
                  <span className="font-bold text-primary">₹{totalCost.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">ORDER DETAILS</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Fabric:</span> <span className="font-medium">{fabric.name}</span></div>
                  <div><span className="text-muted-foreground">Style:</span> <span className="font-medium">{style.name}</span></div>
                  <div><span className="text-muted-foreground">Measurements:</span> <span className="font-medium">{measurementMode === 'saved' ? 'Saved' : 'In Person'}</span></div>
                  {customNotes && <div className="col-span-2"><span className="text-muted-foreground">Notes:</span> <span className="font-medium">{customNotes}</span></div>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 4: Find Tailor */}
      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold font-headline flex items-center gap-2"><Scissors className="h-5 w-5 text-primary" /> Choose a Tailor</h2>
          <p className="text-sm text-muted-foreground">Select a tailor to stitch your {style?.name || 'garment'}.</p>

          {tailors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tailors.map((t) => (
                <div key={t.uid} onClick={() => setSelectedTailor(t)}
                  className={cn(
                    'flex items-start gap-3 p-4 rounded-2xl border text-left transition-all hover:shadow-md cursor-pointer',
                    selectedTailor?.uid === t.uid ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'hover:border-primary/40'
                  )}>
                  <Avatar className="h-12 w-12 shrink-0 border-2 border-primary/20">
                    <AvatarImage src={t.photoURL || `https://picsum.photos/seed/${t.uid}/100/100`} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">{(t.displayName || '?').charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold truncate">{t.displayName || 'Unknown'}</h3>
                      {selectedTailor?.uid === t.uid && <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-primary-foreground" /></div>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{t.shopName || 'Independent'}</p>
                    {t.location && <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5"><MapPin className="h-3 w-3" />{t.location}</div>}
                    <div className="mt-1"><StarRating rating={t.rating || 0} /></div>
                    {t.specialties?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {t.specialties.slice(0, 3).map((s) => <Badge key={s} variant="secondary" className="text-[10px] rounded-full py-0">{s}</Badge>)}
                      </div>
                    )}
                    <div className="mt-2">
                      <TailorProfileViewDialog tailor={t} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Scissors className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No tailors available</p>
              <p className="text-xs mt-1">Visit /seed to populate demo tailors.</p>
            </div>
          )}

          {/* Order summary at bottom */}
          {selectedTailor && style && fabric && (
            <Card className="border-primary/20 rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Order: <span className="text-primary">{style.name}</span> in <span className="text-primary">{fabric.name}</span></p>
                    <p className="text-xs text-muted-foreground">Tailor: {selectedTailor.displayName} · {measurementMode === 'saved' ? 'Saved measurements' : 'In-person measurements'}</p>
                  </div>
                  <p className="text-xl font-bold text-primary">₹{totalCost.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="rounded-full gap-1">
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>

        {step < STEPS.length - 1 ? (
          <Button onClick={() => { if (step === 2) saveMeasurementsToFirestore(); setStep(step + 1); }} disabled={!canProceed()} className="rounded-full gap-1">
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handlePlaceOrder} disabled={!selectedTailor || placing} className="rounded-full gap-2 bg-emerald-600 hover:bg-emerald-700">
            {placing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
            Place Order · ₹{totalCost.toLocaleString()}
          </Button>
        )}
      </div>
    </div>
  );
}
