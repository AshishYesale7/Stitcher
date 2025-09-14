import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scissors, Users, ArrowRight } from 'lucide-react';
import Logo from '@/components/logo';

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <header className="px-4 lg:px-6 h-16 flex items-center shadow-sm">
        <Link href="/" className="flex items-center justify-center gap-2" prefetch={false}>
          <Logo />
          <span className="text-2xl font-bold font-headline text-primary">Stitcher</span>
        </Link>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-6 text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                Your Perfect Fit, Found.
              </h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Stitcher connects you with skilled tailors to bring your custom clothing ideas to life. For tailors, it's the ultimate tool to manage and grow your business.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mt-8">
                <Card className="flex flex-col text-left hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 text-primary p-3 rounded-full">
                        <Users className="h-8 w-8" />
                      </div>
                      <CardTitle className="text-2xl font-headline">For Customers</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <CardDescription className="flex-1 mb-6">
                      Discover talented local tailors, design your dream garment, and track your order from start to finish.
                    </CardDescription>
                    <Button asChild className="w-full mt-auto">
                      <Link href="/customer/dashboard">
                        Find a Tailor
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
                <Card className="flex flex-col text-left hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 text-primary p-3 rounded-full">
                        <Scissors className="h-8 w-8" />
                      </div>
                      <CardTitle className="text-2xl font-headline">For Tailors</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <CardDescription className="flex-1 mb-6">
                      Showcase your portfolio, manage customer orders seamlessly, and grow your tailoring business with our powerful tools.
                    </CardDescription>
                    <Button asChild variant="secondary" className="w-full mt-auto">
                      <Link href="/tailor/dashboard">
                        Join as a Tailor
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 Stitcher. All rights reserved.</p>
      </footer>
    </div>
  );
}
