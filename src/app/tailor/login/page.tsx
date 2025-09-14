import LoginForm from '@/components/login-form';
import Logo from '@/components/logo';
import Link from 'next/link';

export default function TailorLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-8">
            <Link href="/" className="flex items-center gap-2 justify-center mb-4">
                <Logo />
                <span className="text-2xl font-bold font-headline text-primary">
                    Stitcher
                </span>
            </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome, Tailor
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to manage your business
          </p>
        </div>
        <LoginForm userType="tailor" />
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Not a tailor?{' '}
          <Link
            href="/customer/login"
            className="underline underline-offset-4 hover:text-primary font-semibold"
          >
            Login as a customer
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
