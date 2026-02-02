
import { ArrowDown } from 'lucide-react';
import ToolGridLoader from '@/components/tool-grid-loader';


export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <main className="flex-1">
        <section className="relative w-full h-[calc(100vh-4rem)] flex items-center justify-center text-center px-4 md:px-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none font-headline">
                Tool <span className="text-primary">Daddy</span>
              </h1>
              <p className="mx-auto text-foreground/80 md:text-xl">
                Your complete suite for media manipulation. Convert, download,
                enhance, and more. All in one place.
              </p>
            </div>
          </div>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
            <div className="flex flex-col items-center gap-2 text-muted-foreground animate-bounce">
              <ArrowDown className="w-6 h-6" />
            </div>
          </div>
        </section>
        <section id="tools" className="w-full py-12 md:py-24 lg:pb-32">
          <div className="px-4 md:px-6 space-y-12">
            <ToolGridLoader />
          </div>
        </section>
      </main>
    </div>
  );
}
