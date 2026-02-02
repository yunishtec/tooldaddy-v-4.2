
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        <Loader2 className="h-12 w-12 animate-spin" />
        <p className="text-lg">Loading Tool...</p>
        <p className="text-sm">Getting things ready for you.</p>
      </div>
    </div>
  );
}
