
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AdCardProps {
    logo: 'placeholder1' | 'placeholder2' | 'placeholder3' | 'placeholder4';
    title: string;
    description: string;
    cta: string;
}

const logos = {
    placeholder1: {
        src: 'https://placehold.co/48x48/a855f7/ffffff.png?text=P1',
        alt: 'Placeholder Logo 1',
    },
    placeholder2: {
        src: 'https://placehold.co/48x48/ec4899/ffffff.png?text=P2',
        alt: 'Placeholder Logo 2',
    },
    placeholder3: {
        src: 'https://placehold.co/48x48/3b82f6/ffffff.png?text=P3',
        alt: 'Placeholder Logo 3',
    },
    placeholder4: {
        src: 'https://placehold.co/48x48/f59e0b/ffffff.png?text=P4',
        alt: 'Placeholder Logo 4',
    }
}

export default function AdCard({ logo, title, description, cta }: AdCardProps) {
    const logoInfo = logos[logo];

    return (
        <Card className="bg-card/30 backdrop-blur-sm border-border/10 hover:border-border/30 transition-all group shadow-lg">
            <CardHeader className="flex flex-row justify-between items-center pb-2">
                <div className="flex items-center gap-3">
                     <Image src={logoInfo.src} alt={logoInfo.alt} width={32} height={32} className="rounded-md" />
                    <CardTitle className="text-base">{title}</CardTitle>
                </div>
                <p className="text-xs font-semibold text-muted-foreground/80 flex items-center gap-1">Sponsored</p>
            </CardHeader>
            <CardContent className="pb-4">
                <CardDescription className="text-sm">
                    {description}
                </CardDescription>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                 <Button variant="outline" size="sm" className="w-full group-hover:bg-accent group-hover:text-accent-foreground transition-colors rounded-full">
                    {cta} <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
            </CardFooter>
        </Card>
    )
}
