'use client';

import { useState } from 'react';
import PaletteCard from '@/components/palette-card';
import { mockPalettes, type Palette } from '@/lib/palettes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Paintbrush, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ColorPaletteGenerator() {
  const [palettes, setPalettes] = useState<Palette[]>(mockPalettes);

  // Function to shuffle an array (Fisher-Yates shuffle)
  const shuffleArray = (array: any[]) => {
    let currentIndex = array.length,  randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex !== 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
  }

  const handleReload = () => {
    // Create a new shuffled array to trigger re-render
    const shuffledPalettes = shuffleArray([...mockPalettes]);
    setPalettes(shuffledPalettes);
  };

  return (
    <div className="w-full">
      <Card className="w-full bg-card/50 backdrop-blur-lg border-border/20 mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Paintbrush /> Color Palette Generator</CardTitle>
            <CardDescription>Discover, create, and share beautiful color palettes.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleReload} aria-label="Reload Palettes">
                <RefreshCw />
            </Button>
            <Button variant="purple"><Plus className="mr-2"/> Create</Button>
          </div>
        </CardHeader>
      </Card>
      
      <div className="columns-1 gap-6 sm:columns-2 md:columns-3 lg:columns-4">
        {palettes.map((palette) => (
          <PaletteCard key={palette.id} palette={palette} />
        ))}
      </div>
    </div>
  );
}
