import LoginForm from '@/components/login-form';
import Logo from '@/components/logo';
import Link from 'next/link';

export default function CustomerLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
            <Link href="/" className="flex items-center gap-2 justify-center mb-4">
                <Logo />
                <span className="text-2xl font-bold font-headline text-primary">
                    Stitcher
                </span>
            </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            Customer Login
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to access your dashboard
          </p>
        </div>
        <LoginForm userType="customer" />
        <p className="px-8 text-center text-sm text-muted-foreground">
          Are you a tailor?{' '}
          <Link
            href="/tailor/login"
            className="underline underline-offset-4 hover:text-primary"
          >
            Login here
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
