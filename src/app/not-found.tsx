import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion, Home, ArrowLeft, Search, Ghost } from 'lucide-react';
import { getPages } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';

export default async function NotFound() {
  const pages = await getPages('public');

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>

      <div className="text-center max-w-2xl mx-auto space-y-8 relative z-10">
        <div className="relative inline-block">
          <h1 className="text-9xl font-black text-primary/5 tracking-tighter select-none">
            404
          </h1>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <Ghost className="w-20 h-20 text-primary animate-bounce mb-2" />
            <span className="text-xl font-bold text-primary">Page Not Found</span>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Lost in the void?
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            The page you are looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="gap-2 h-12 px-8 text-base">
            <Link href="/">
              <Home className="w-5 h-5" />
              Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2 h-12 px-8 text-base">
            <Link href="/admin">
              <ArrowLeft className="w-5 h-5" />
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {pages.length > 0 && (
        <div className="mt-20 w-full max-w-5xl">
          <div className="flex items-center justify-center gap-2 mb-8 text-muted-foreground">
            <Search className="w-4 h-4" />
            <p className="text-sm uppercase tracking-widest font-medium">
              Popular Destinations
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {pages.slice(0, 6).map(page => (
              <Link key={page.id} href={`/${page.urlSlug}`} className="group block h-full">
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 bg-card/50 backdrop-blur-sm overflow-hidden group-hover:bg-accent/5">
                  <CardContent className="p-6 flex items-center gap-4 h-full">
                    <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                      <ArrowLeft className="w-5 h-5 rotate-180" />
                    </div>
                    <span className="font-semibold text-lg truncate">{page.title}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
