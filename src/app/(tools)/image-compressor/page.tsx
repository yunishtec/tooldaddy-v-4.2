
'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const ImageCompressor = dynamic(() => import('./_components/image-compressor'), {
    loading: () => <ImageCompressorSkeleton />,
    ssr: false
});


function ImageCompressorSkeleton() {
  return (
    <div className="w-full">
      <div className="w-full bg-card/50 backdrop-blur-lg border-border/20 rounded-lg p-6 space-y-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-5 w-80" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  )
}

export default function ImageCompressorPage() {
    return <ImageCompressor />;
}
