'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  User,
} from 'firebase/auth';
import { app } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Phone, ShieldCheck, Mail, User as UserIcon } from 'lucide-react';
import { createUserProfile } from '@/app/actions/user';

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
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');

  useEffect(() => {
    // Only run on the client
    if (typeof window !== 'undefined' && !window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'invisible',
            'callback': (response: any) => {
              // reCAPTCHA solved, allow signInWithPhoneNumber.
            },
        });
    }
  }, []);

  const handleSuccessfulLogin = async (user: User) => {
    try {
      await createUserProfile(user, userType);
      router.push(`/${userType}/dashboard`);
    } catch (error) {
       console.error("Profile Creation Error:", error);
       toast({
        variant: "destructive",
        title: "Profile Creation Failed",
        description: "Could not create your user profile. Please try again.",
      });
      setIsLoading(false);
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await handleSuccessfulLogin(result.user);
    } catch (error: any) {
      // Don't show an error toast if the user closes the popup
      if (error.code === 'auth/popup-closed-by-user') {
        setIsLoading(false);
        return;
      }
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
    
    if (!window.recaptchaVerifier) {
        console.error("Recaptcha verifier not initialized.");
        toast({
            variant: "destructive",
            title: "Recaptcha Error",
            description: "Please refresh the page and try again.",
        });
        setIsLoading(false);
        return;
    }

    const appVerifier = window.recaptchaVerifier;
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, `+91${phone}`, appVerifier);
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
        description: "Could not send OTP. Please check the number and try again.",
      });
      // Reset reCAPTCHA on error
      if (typeof grecaptcha !== 'undefined' && window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then(function(widgetId) {
            grecaptcha.reset(widgetId);
        });
      }
    } finally {
        setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!window.confirmationResult) {
        console.error("No confirmation result available.");
        toast({
            variant: "destructive",
            title: "Verification Failed",
            description: "Please request a new OTP.",
        });
        setStep('phone');
        return;
    }

    setIsLoading(true);
    try {
      const result = await window.confirmationResult.confirm(otp);
      if (result?.user) {
        await handleSuccessfulLogin(result.user);
      } else {
        throw new Error("User not found after OTP confirmation.");
      }
    } catch (error) {
        console.error("OTP Verification Error:", error);
        toast({
            variant: "destructive",
            title: "OTP Verification Failed",
            description: "The OTP is incorrect. Please try again.",
        });
        setIsLoading(false);
    }
  };

  const renderPhoneAuth = () => {
    if (step === 'phone') {
        return (
            <form onSubmit={handlePhoneSignIn} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="phone" className="text-muted-foreground">Phone Number</Label>
                    <div className="flex items-center">
                        <div className="flex items-center gap-2 pl-3 pr-2 py-2 bg-input rounded-l-md border border-r-0 border-input text-foreground">
                            <span>🇮🇳</span>
                            <span className="text-sm text-foreground">+91</span>
                        </div>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="Your phone number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            className="rounded-l-none border-l-0 text-base text-foreground"
                        />
                    </div>
                </div>
                <Button type="submit" disabled={isLoading} className="w-full h-12 text-base rounded-full">
                    {isLoading ? <Loader2 className="animate-spin" /> : 'Send OTP'}
                </Button>
            </form>
        )
    }
    return (
        <form onSubmit={handleOtpSubmit} className="space-y-6">
             <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                    id="otp"
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className="h-12 text-center text-lg tracking-[0.5em]"
                />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full h-12 text-base rounded-full">
                {isLoading ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
                Verify OTP
            </Button>
        </form>
    );
  }

  const renderEmailAuth = () => (
    <div className="text-center text-muted-foreground space-y-4 py-12">
        <Mail className="mx-auto w-10 h-10"/>
        <p>Email authentication is coming soon.</p>
    </div>
  );

  return (
    <div className="w-full max-w-sm space-y-6">
       <div className="flex justify-center">
            <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-card/60 ring-2 ring-primary/50 shadow-lg backdrop-blur-sm">
                <UserIcon className="w-10 h-10 text-primary" />
                <div className="absolute inset-0 rounded-full ring-2 ring-primary/50 animate-pulse"></div>
            </div>
        </div>
      <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-muted/50">
        <Button
          variant={authMethod === 'email' ? 'outline' : 'ghost'}
          className={authMethod === 'email' ? 'bg-background' : ''}
          onClick={() => setAuthMethod('email')}
        >
          <Mail className="mr-2" /> Email
        </Button>
        <Button
          variant={authMethod === 'phone' ? 'outline' : 'ghost'}
          className={authMethod === 'phone' ? 'bg-background' : ''}
          onClick={() => setAuthMethod('phone')}
        >
          <Phone className="mr-2" /> Phone
        </Button>
      </div>

      <div id="recaptcha-container"></div>
      
      {authMethod === 'phone' ? renderPhoneAuth() : renderEmailAuth()}
      
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
      
      <Button variant="outline" type="button" disabled={isLoading} onClick={handleGoogleSignIn} className="w-full h-12 text-base rounded-full">
        {isLoading ? <Loader2 className="animate-spin" /> : <><GoogleIcon /> <span className="text-foreground">Sign in with Google</span></>}
      </Button>
    </div>
  );
}
