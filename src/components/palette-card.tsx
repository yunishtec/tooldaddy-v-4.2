'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { type Palette } from '@/lib/palettes';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';

// Helper to get contrasting text color
function getContrastingTextColor(hex: string): 'text-white' | 'text-black' {
    if (!hex || hex.length < 7) return 'text-white';
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? 'text-black' : 'text-white';
}

interface PaletteCardProps {
    palette: Palette;
}

export default function PaletteCard({ palette }: PaletteCardProps) {
    const { toast } = useToast();
    const [isLiked, setIsLiked] = useState(false);
    const [likes, setLikes] = useState(palette.likes);
    
    const handleCopy = (color: string) => {
        navigator.clipboard.writeText(color.toUpperCase());
        toast({
            title: `Copied ${color.toUpperCase()}`,
        });
    };
    
    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikes(prev => isLiked ? prev - 1 : prev + 1);
        // In a real app, you'd call a function here to update Firestore
    }

    const colorHeights = ['flex-grow-[7]', 'flex-grow-[6]', 'flex-grow-[3]', 'flex-grow-[2]'];

    return (
        <div className="group break-inside-avoid mb-6">
            <div className="relative overflow-hidden rounded-lg shadow-sm transition-shadow duration-300 group-hover:shadow-xl">
                <div className="flex h-48 w-full flex-col">
                    {palette.colors.map((color, index) => (
                        <div
                            key={index}
                            className={cn(
                                "relative flex cursor-pointer items-center justify-center",
                                colorHeights[index]
                            )}
                            style={{ backgroundColor: color }}
                            onClick={() => handleCopy(color)}
                        >
                            <span
                                className={cn(
                                    'font-mono text-sm font-semibold uppercase opacity-0 transition-opacity duration-200 group-hover:opacity-100',
                                    getContrastingTextColor(color)
                                )}
                            >
                                {color.substring(1)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="mt-2 flex items-center justify-between px-1">
                <Button variant="ghost" size="sm" onClick={handleLike} className="flex items-center gap-2 text-muted-foreground">
                   <Heart className={cn("h-4 w-4", isLiked && "fill-red-500 text-red-500")}/>
                   <span className="text-sm font-medium">{likes}</span>
                </Button>
                <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(palette.createdAt), { addSuffix: true })}
                </span>
            </div>
        </div>
    );
}
