
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
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck, User as UserIcon, ChevronsUpDown } from 'lucide-react';
import { createUserProfile } from '@/app/actions/user';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { countries, type Country } from '@/lib/countries';

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
  const [resendCooldown, setResendCooldown] = useState(0);

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countries.find(c => c.code === 'IN')!
  );

  useEffect(() => {
    fetch('http://ip-api.com/json/?fields=countryCode')
        .then(res => res.json())
        .then(data => {
            const country = countries.find(c => c.code === data.countryCode);
            if (country) {
                setSelectedCountry(country);
            }
        })
        .catch(() => {
            // Fallback to India if the API fails
            setSelectedCountry(countries.find(c => c.code === 'IN')!);
        });
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    const isMobile = /Mobi/i.test(window.navigator.userAgent);
    if (step === 'otp' && 'OTPCredential' in window && isMobile) {
      const ac = new AbortController();

      navigator.credentials.get({
        otp: { transport:['sms'] },
        signal: ac.signal
      }).then(otpCredential => {
        if (otpCredential) {
          setOtp(otpCredential.code);
          toast({
            title: "OTP Detected",
            description: "We've automatically filled the OTP for you.",
          });
        }
      }).catch(err => {
        if (err.name !== 'AbortError') {
          console.error("WebOTP API error:", err);
        }
      });

      return () => {
        ac.abort();
      };
    }
  }, [step]);


  const handleSuccessfulLogin = async (user: User) => {
    try {
      await createUserProfile({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber,
      }, userType);
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
      if (error.code !== 'auth/popup-closed-by-user') {
        console.error("Google Sign-In Error:", error);
        toast({
          variant: "destructive",
          title: "Google Sign-In Failed",
          description: "Could not sign in with Google. Please try again.",
        });
      }
      setIsLoading(false);
    }
  };

  const handlePhoneSignIn = async () => {
    setIsLoading(true);
    try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'invisible',
            'callback': () => {},
        });
        
        const fullPhoneNumber = `${selectedCountry.dial_code}${phone}`;
        const confirmationResult = await signInWithPhoneNumber(auth, fullPhoneNumber, window.recaptchaVerifier);
        window.confirmationResult = confirmationResult;
        setStep('otp');
        setResendCooldown(30);
        toast({
            title: "OTP Sent",
            description: `We've sent a verification code to ${fullPhoneNumber}.`,
        });
    } catch (error) {
      console.error("Phone Sign-In Error:", error);
      toast({
        variant: "destructive",
        title: "Phone Sign-In Failed",
        description: "Could not send OTP. Please check the number and try again.",
      });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handlePhoneFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handlePhoneSignIn();
  }

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
    } catch (error: any) {
        console.error("OTP Verification Error:", error);
        let description = "The OTP is incorrect. Please try again.";
        if (error.code === 'auth/code-expired') {
          description = 'The OTP has expired. Please request a new one.';
        }
        if (error.code === 'auth/invalid-verification-code') {
          description = 'The verification code is invalid. Please try again.';
          setOtp('');
        }
        toast({
            variant: "destructive",
            title: "OTP Verification Failed",
            description: description,
        });
        setIsLoading(false);
    }
  };

  const renderPhoneAuth = () => {
    if (step === 'phone') {
        return (
            <form onSubmit={handlePhoneFormSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="phone" className="text-muted-foreground">Phone Number</Label>
                    <div className="flex items-center">
                         <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-[130px] justify-between rounded-r-none border-r-0 text-foreground"
                                >
                                    <span className="truncate">{selectedCountry.flag} {selectedCountry.dial_code}</span>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0">
                                <Command>
                                    <CommandInput placeholder="Search country..." />
                                    <CommandList>
                                        <CommandEmpty>No country found.</CommandEmpty>
                                        <CommandGroup>
                                            {countries.map((country) => (
                                                <CommandItem
                                                    key={country.code}
                                                    value={`${country.name} (${country.dial_code})`}
                                                    onSelect={() => {
                                                        setSelectedCountry(country);
                                                        setPopoverOpen(false);
                                                    }}
                                                >
                                                    {country.flag} {country.name} ({country.dial_code})
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="Your phone number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            className="rounded-l-none text-base text-foreground"
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
                    className="h-12 text-center text-lg tracking-[0.5em] text-foreground"
                    autoComplete="one-time-code"
                />
            </div>
            <div className="flex justify-between items-center -mt-4">
                <Button
                    type="button"
                    variant="link"
                    onClick={() => setStep('phone')}
                    disabled={isLoading}
                    className="text-sm"
                >
                  Back
                </Button>
                <Button 
                    type="button" 
                    variant="link" 
                    onClick={handlePhoneSignIn}
                    disabled={isLoading || resendCooldown > 0}
                    className="text-sm"
                >
                    {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                </Button>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full h-12 text-base rounded-full">
                {isLoading ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
                Verify OTP
            </Button>
        </form>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-6">
       <div className="flex justify-center">
            <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-card/60 ring-2 ring-primary/50 shadow-lg backdrop-blur-sm">
                <UserIcon className="w-10 h-10 text-primary" />
                <div className="absolute inset-0 rounded-full ring-2 ring-primary/50 animate-pulse"></div>
            </div>
        </div>
      
      <div id="recaptcha-container"></div>
      
      {renderPhoneAuth()}
      
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
      
      <Button variant="outline" type="button" disabled={isLoading} onClick={handleGoogleSignIn} className="w-full h-12 text-base rounded-full text-foreground">
        {isLoading ? <Loader2 className="animate-spin" /> : <><GoogleIcon /> <span className="text-foreground">Sign in with Google</span></>}
      </Button>
    </div>
  );
}
