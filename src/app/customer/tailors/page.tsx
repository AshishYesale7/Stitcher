'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { getAllTailors, createOrder, createConversation, subscribeToReviews, addReview, toggleThumbsUp, type TailorProfile, type Review } from '@/lib/firestore-helpers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Loader2, Search, Star, MapPin, MessageCircle, ShoppingBag, Shirt, Phone, Clock, Award, ThumbsUp, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const GARMENT_TYPES = ['Shirt', 'Pants', 'Kurta', 'Saree', 'Blouse', 'Dress', 'Suit', 'Sherwani'];

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const iconSize = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${iconSize} ${i <= Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30 fill-muted-foreground/10'}`} />
      ))}
      <span className={`ml-1 font-semibold ${size === 'lg' ? 'text-lg' : 'text-sm'}`}>{rating.toFixed(1)}</span>
    </div>
  );
}

// Firebase-backed reviews
function TailorProfileDialog({ tailor, onMessage, onOrder }: {
  tailor: TailorProfile;
  onMessage: () => void;
  onOrder: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!open) return;
    const unsub = subscribeToReviews(tailor.uid, setReviews);
    return () => unsub();
  }, [open, tailor.uid]);

  const handleSubmitReview = async () => {
    if (!currentUser || !newReviewText.trim()) return;
    setSubmitting(true);
    try {
      await addReview({
        tailorId: tailor.uid,
        customerId: currentUser.uid,
        customerName: currentUser.displayName || currentUser.phoneNumber || 'Customer',
        customerPhotoURL: currentUser.photoURL || undefined,
        rating: newRating,
        text: newReviewText.trim(),
      });
      setNewReviewText('');
      setNewRating(5);
    } catch (e) {
      console.error('Failed to submit review', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleThumbsUp = async (reviewId: string) => {
    if (!currentUser) return;
    await toggleThumbsUp(reviewId, currentUser.uid);
  };

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 ? reviews.reduce((a, r) => a + r.rating, 0) / totalReviews : (tailor.rating || 0);
  const ratingCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => { if (ratingCounts[r.rating] !== undefined) ratingCounts[r.rating]++; });

  const formatDate = (ts: any) => {
    if (!ts?.toDate) return '';
    const d = ts.toDate();
    const diff = Date.now() - d.getTime();
    const days = Math.floor(diff / 86400000);
    if (days < 1) return 'Today';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-start gap-4 w-full text-left cursor-pointer group">
          <Avatar className="h-14 w-14 border-2 border-primary/20 shrink-0 group-hover:ring-2 group-hover:ring-primary/30 transition-all">
            <AvatarImage src={tailor.photoURL || `https://picsum.photos/seed/${tailor.uid}/200/200`} alt={tailor.displayName || ''} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">{tailor.displayName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">{tailor.displayName || 'Unknown'}</h3>
            <p className="text-sm text-muted-foreground truncate">{tailor.shopName || 'Independent Tailor'}</p>
            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{tailor.location || 'Location not set'}</span>
            </div>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogTitle className="sr-only">{tailor.displayName || 'Tailor'} Profile</DialogTitle>
        <div className="h-20 -mx-6 -mt-6 bg-gradient-to-r from-primary/30 via-purple-500/30 to-blue-500/30 rounded-t-lg" />
        <div className="flex items-end gap-4 -mt-10 mb-2">
          <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
            <AvatarImage src={tailor.photoURL || `https://picsum.photos/seed/${tailor.uid}/200/200`} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">{tailor.displayName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 pb-1">
            <h2 className="text-xl font-bold font-headline truncate">{tailor.displayName || 'Unknown'}</h2>
            <p className="text-sm text-muted-foreground">{tailor.shopName || 'Independent Tailor'}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 my-4">
          <div className="bg-muted/50 rounded-xl p-3 text-center"><Star className="h-4 w-4 mx-auto mb-1 text-yellow-500" /><p className="text-lg font-bold">{avgRating.toFixed(1)}</p><p className="text-[10px] text-muted-foreground">Rating</p></div>
          <div className="bg-muted/50 rounded-xl p-3 text-center"><ThumbsUp className="h-4 w-4 mx-auto mb-1 text-emerald-500" /><p className="text-lg font-bold">{totalReviews}</p><p className="text-[10px] text-muted-foreground">Reviews</p></div>
          <div className="bg-muted/50 rounded-xl p-3 text-center"><Award className="h-4 w-4 mx-auto mb-1 text-purple-500" /><p className="text-lg font-bold">{tailor.specialties?.length || 0}</p><p className="text-[10px] text-muted-foreground">Specialties</p></div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" />{tailor.location || 'Location not set'}</div>
          {tailor.phoneNumber && <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" />{tailor.phoneNumber}</div>}
          <div className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4 text-muted-foreground" />Typically responds within 1 hour</div>
        </div>

        {tailor.bio && (<><Separator className="my-4" /><div><h3 className="text-sm font-semibold mb-1">About</h3><p className="text-sm text-muted-foreground leading-relaxed">{tailor.bio}</p></div></>)}
        {tailor.specialties?.length > 0 && (<><Separator className="my-4" /><div><h3 className="text-sm font-semibold mb-2">Specialties</h3><div className="flex flex-wrap gap-1.5">{tailor.specialties.map((s) => <Badge key={s} variant="secondary" className="text-xs rounded-full">{s}</Badge>)}</div></div></>)}

        <Separator className="my-4" />
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Customer Reviews</h3>
            <span className="text-xs text-muted-foreground">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</span>
          </div>

          {totalReviews > 0 && (
            <div className="flex items-center gap-4 mb-4 bg-muted/50 rounded-xl p-3">
              <div className="text-center"><p className="text-3xl font-bold">{avgRating.toFixed(1)}</p><StarRating rating={avgRating} size="sm" /></div>
              <div className="flex-1 space-y-1">
                {[5, 4, 3, 2, 1].map((star) => {
                  const pct = totalReviews > 0 ? Math.round((ratingCounts[star] / totalReviews) * 100) : 0;
                  return (<div key={star} className="flex items-center gap-2 text-xs"><span className="w-3 text-muted-foreground">{star}</span><div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} /></div><span className="w-7 text-right text-muted-foreground">{pct}%</span></div>);
                })}
              </div>
            </div>
          )}

          {currentUser && (
            <div className="border rounded-xl p-3 mb-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Write a Review</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button key={i} onClick={() => setNewRating(i)} onMouseEnter={() => setHoverRating(i)} onMouseLeave={() => setHoverRating(0)}>
                    <Star className={`w-5 h-5 cursor-pointer transition-colors ${i <= (hoverRating || newRating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`} />
                  </button>
                ))}
                <span className="text-xs text-muted-foreground ml-1">{newRating}/5</span>
              </div>
              <div className="flex gap-2">
                <Input placeholder="Share your experience..." value={newReviewText} onChange={(e) => setNewReviewText(e.target.value)} className="text-sm h-8" />
                <Button size="sm" className="h-8 rounded-full gap-1" onClick={handleSubmitReview} disabled={submitting || !newReviewText.trim()}>
                  {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {reviews.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No reviews yet. Be the first to review!</p>}
            {reviews.map((review) => (
              <div key={review.id} className="border rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{review.customerName?.charAt(0) || '?'}</div><span className="text-sm font-medium">{review.customerName}</span></div>
                  <span className="text-[10px] text-muted-foreground">{formatDate(review.createdAt)}</span>
                </div>
                <div className="flex gap-0.5 mb-1">{[1, 2, 3, 4, 5].map((i) => <Star key={i} className={`w-3 h-3 ${i <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/20'}`} />)}</div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">{review.text}</p>
                <button onClick={() => handleThumbsUp(review.id)} className={`inline-flex items-center gap-1 text-[11px] rounded-full px-2 py-0.5 transition-colors ${review.thumbsUpBy?.includes(currentUser?.uid || '') ? 'bg-primary/10 text-primary font-semibold' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                  <ThumbsUp className="h-3 w-3" /> {review.thumbsUp || 0}
                </button>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-4" />
        <div className="flex items-center gap-2">
          <Button className="flex-1 rounded-full gap-1.5" onClick={() => { setOpen(false); onOrder(); }}><ShoppingBag className="h-4 w-4" /> Place Order</Button>
          <Button variant="outline" className="flex-1 rounded-full gap-1.5" onClick={() => { setOpen(false); onMessage(); }}><MessageCircle className="h-4 w-4" /> Message</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


function PlaceOrderDialog({ tailor }: { tailor: TailorProfile }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const user = auth.currentUser;
  const [form, setForm] = useState({ garmentType: '', designDetails: '', amount: '', notes: '' });

  const handleSubmit = async () => {
    if (!user || !form.garmentType) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a garment type and log in.' });
      return;
    }
    setSaving(true);
    try {
      await createOrder({
        tailorId: tailor.uid,
        customerId: user.uid,
        customerName: user.displayName || 'Customer',
        customerEmail: user.email || '',
        garmentType: form.garmentType,
        designDetails: form.designDetails,
        amount: parseFloat(form.amount) || 0,
        notes: form.notes,
      });
      toast({ title: 'Order Placed!', description: `Your order has been sent to ${tailor.displayName}.` });
      setOpen(false);
      setForm({ garmentType: '', designDetails: '', amount: '', notes: '' });
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to place order.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-full gap-1.5"><ShoppingBag className="h-3.5 w-3.5" /> Place Order</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Order from {tailor.displayName}</DialogTitle>
          <DialogDescription>{tailor.shopName} · {tailor.location}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Garment Type *</Label>
            <Select onValueChange={(v) => setForm({ ...form, garmentType: v })}>
              <SelectTrigger><SelectValue placeholder="Select garment" /></SelectTrigger>
              <SelectContent>
                {(tailor.specialties?.length > 0 ? tailor.specialties : GARMENT_TYPES).map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Design Details</Label>
            <Textarea placeholder="Describe your design..." value={form.designDetails} onChange={(e) => setForm({ ...form, designDetails: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Budget (₹)</Label>
            <Input type="number" placeholder="e.g., 2000" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea placeholder="Special instructions..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={saving} className="rounded-full">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Place Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function CustomerTailorsPage() {
  const [tailors, setTailors] = useState<TailorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const { toast } = useToast();
  const router = useRouter();
  const user = auth.currentUser;

  useEffect(() => {
    getAllTailors(user?.uid).then(setTailors).finally(() => setIsLoading(false));
  }, [user]);

  const handleMessage = async (tailor: TailorProfile) => {
    if (!user) return;
    try {
      await createConversation(tailor.uid, user.uid, tailor.displayName, user.displayName || 'Customer');
      router.push('/customer/messages');
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to start conversation.' });
    }
  };

  const allSpecialties = [...new Set(tailors.flatMap((t) => t.specialties || []))].sort();
  const filtered = tailors.filter((t) => {
    const matchesSearch = (t.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) || (t.shopName || '').toLowerCase().includes(searchQuery.toLowerCase()) || (t.location || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = filterSpecialty === 'all' || t.specialties?.includes(filterSpecialty);
    return matchesSearch && matchesSpecialty;
  }).sort((a, b) => (b.rating || 0) - (a.rating || 0));

  if (isLoading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Find Tailors</h1>
        <p className="text-muted-foreground mt-1">Browse and connect with skilled tailors near you.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, shop, or location..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 rounded-full bg-muted border-0 focus-visible:ring-1" />
        </div>
        <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
          <SelectTrigger className="w-full sm:w-48 rounded-full"><SelectValue placeholder="All Specialties" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specialties</SelectItem>
            {allSpecialties.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((tailor) => (
            <Card key={tailor.uid} className="border rounded-2xl flex flex-col hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-0.5">
              <div className="h-2 rounded-t-2xl bg-gradient-to-r from-primary/60 via-purple-500/60 to-blue-500/60" />
              <CardContent className="p-5 flex flex-col flex-1">
                <TailorProfileDialog
                  tailor={tailor}
                  onMessage={() => handleMessage(tailor)}
                  onOrder={() => {
                    // Trigger place order dialog - for now redirect to design page
                    router.push('/customer/design-garment');
                  }}
                />
                <div className="mb-3 mt-4"><StarRating rating={tailor.rating || 0} /></div>
                {tailor.bio && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{tailor.bio}</p>}
                {tailor.specialties?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {tailor.specialties.slice(0, 4).map((s) => <Badge key={s} variant="secondary" className="text-xs rounded-full">{s}</Badge>)}
                  </div>
                )}
                <div className="flex items-center gap-2 pt-3 border-t mt-auto">
                  <PlaceOrderDialog tailor={tailor} />
                  <Button variant="outline" size="sm" className="rounded-full gap-1.5" onClick={() => handleMessage(tailor)}>
                    <MessageCircle className="h-3.5 w-3.5" /> Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <Shirt className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="font-semibold text-lg">No tailors found</p>
          <p className="text-sm mt-1">{searchQuery ? 'Try a different search.' : 'Visit /seed to populate demo tailors.'}</p>
        </div>
      )}
    </div>
  );
}
