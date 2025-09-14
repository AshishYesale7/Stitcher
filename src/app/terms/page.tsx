
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Terms & Conditions</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p>Welcome to StitchLink!</p>
          <p>These terms and conditions outline the rules and regulations for the use of StitchLink's Website, located at stitchlink.app.</p>
          <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use StitchLink if you do not agree to take all of the terms and conditions stated on this page.</p>
          
          <h3 className="font-headline text-xl mt-4"><strong>Cookies</strong></h3>
          <p>We employ the use of cookies. By accessing StitchLink, you agreed to use cookies in agreement with the StitchLink's Privacy Policy.</p>
          
          <h3 className="font-headline text-xl mt-4"><strong>License</strong></h3>
          <p>Unless otherwise stated, StitchLink and/or its licensors own the intellectual property rights for all material on StitchLink. All intellectual property rights are reserved. You may access this from StitchLink for your own personal use subjected to restrictions set in these terms and conditions.</p>
          
          <p><strong>Content coming soon...</strong></p>
        </CardContent>
      </Card>
    </div>
  );
}
