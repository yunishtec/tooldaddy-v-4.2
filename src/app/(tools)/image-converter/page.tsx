
'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const ImageConverter = dynamic(() => import('./_components/image-converter'), {
    loading: () => <ImageConverterSkeleton />,
    ssr: false
});

function ImageConverterSkeleton() {
  return (
    <div className="w-full">
      <div className="w-full bg-card/50 backdrop-blur-lg border-border/20 rounded-lg p-6 space-y-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-5 w-96" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  )
}

export default function ImageConverterPage() {
    return <ImageConverter />;
}
