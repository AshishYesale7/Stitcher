'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import { app } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Phone, ShieldCheck } from 'lucide-react';

declare global {
    interface Window {
        recaptchaVerifier?: RecaptchaVerifier;
        confirmationResult?: ConfirmationResult;
    }
}

const auth = getAuth(app);

function GoogleIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.04,0-9.345-3.373-11.178-7.96l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
        </svg>
    );
}

export default function LoginForm({ userType }: { userType: 'customer' | 'tailor' }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
      });
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push(`/${userType}/dashboard`);
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      toast({
        variant: "destructive",
        title: "Google Sign-In Failed",
        description: "Could not sign in with Google. Please try again.",
      });
      setIsLoading(false);
    }
  };

  const handlePhoneSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setupRecaptcha();
    const appVerifier = window.recaptchaVerifier!;
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, `+${phone}`, appVerifier);
      window.confirmationResult = confirmationResult;
      setStep('otp');
      toast({
        title: "OTP Sent",
        description: "We've sent a verification code to your phone.",
      });
    } catch (error) {
      console.error("Phone Sign-In Error:", error);
      toast({
        variant: "destructive",
        title: "Phone Sign-In Failed",
        description: "Could not send OTP. Please check the phone number and try again.",
      });
    } finally {
        setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await window.confirmationResult?.confirm(otp);
      router.push(`/${userType}/dashboard`);
    } catch (error) {
        console.error("OTP Verification Error:", error);
        toast({
            variant: "destructive",
            title: "OTP Verification Failed",
            description: "The OTP you entered is incorrect. Please try again.",
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div id="recaptcha-container"></div>
        {step === 'phone' ? (
            <form onSubmit={handlePhoneSignIn}>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="flex items-center gap-2">
                            <span className="text-sm p-2 bg-muted rounded-l-md border border-r-0 border-input">+</span>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="1234567890"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                                className="rounded-l-none"
                            />
                        </div>
                    </div>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" /> : <Phone />}
                        Sign in with Phone
                    </Button>
                </div>
            </form>
        ) : (
            <form onSubmit={handleOtpSubmit}>
                <div className="grid gap-4">
                     <div className="grid gap-2">
                        <Label htmlFor="otp">Verification Code</Label>
                        <Input
                            id="otp"
                            type="text"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
                        Verify OTP
                    </Button>
                </div>
            </form>
        )}
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      
      <Button variant="outline" type="button" disabled={isLoading} onClick={handleGoogleSignIn}>
        {isLoading ? <Loader2 className="animate-spin" /> : <GoogleIcon />}
        Google
      </Button>
    </div>
  );
}
