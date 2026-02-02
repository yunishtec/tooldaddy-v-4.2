
'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FileDropzone from '@/components/file-dropzone';
import { useToast } from '@/hooks/use-toast';
import { Palette, Loader2, Copy, Check } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import AdModal from '@/components/ad-modal';


export default function ColorPaletteExtractor() {
  const [image, setImage] = useState<string | null>(null);
  const [palette, setPalette] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [numColors, setNumColors] = useState(6);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const { toast } = useToast();
  const workerRef = useRef<Worker>();
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [imageToProcess, setImageToProcess] = useState<{ file: File, count: number } | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  const generatePalette = useCallback((file: File, colorCount: number) => {
    setIsLoading(true);
    setPalette([]);
    const reader = new FileReader();
    reader.onload = (e) => {
        const imageSrc = e.target?.result as string;
        setImage(imageSrc);

        const img = document.createElement('img');
        img.crossOrigin = 'Anonymous';
        img.src = imageSrc;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setIsLoading(false);
            toast({ title: 'Error', description: 'Could not process image.', variant: 'destructive'});
            return;
          }
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, img.width, img.height);
          
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          workerRef.current?.postMessage({
              imageData,
              colorCount
          });
        };
         img.onerror = () => {
            setIsLoading(false);
            toast({ title: 'Error', description: 'Failed to load image for processing.', variant: 'destructive'});
        }
    };
    reader.readAsDataURL(file);
  }, [toast]);

  useEffect(() => {
    workerRef.current = new Worker(new URL('../../../../workers/color-quantizer.worker.ts', import.meta.url));

    workerRef.current.onmessage = (event) => {
      if (event.data.type === 'palette') {
        setPalette(event.data.palette);
        setIsLoading(false);
      } else if (event.data.type === 'error') {
        setIsLoading(false);
        toast({ title: 'Error', description: 'Could not process image.', variant: 'destructive'});
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, [toast]);

  const handleFileDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;

    if (isLoading) return;
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload an image file.',
        variant: 'destructive',
      });
      return;
    }
    setCurrentFile(file);
    setImage(URL.createObjectURL(file));
    setImageToProcess({ file, count: numColors });
    setIsAdModalOpen(true);
  }, [isLoading, toast, numColors]);

  const handleAdFinish = () => {
    setIsAdModalOpen(false);
    if (imageToProcess) {
      generatePalette(imageToProcess.file, imageToProcess.count);
      setImageToProcess(null);
    }
  }

  const handleRegenerate = (newCount: number) => {
    if (!currentFile) return;
    setImageToProcess({ file: currentFile, count: newCount });
    setIsAdModalOpen(true);
  }

  const copyToClipboard = (color: string) => {
    const hexColor = rgbToHex(color);
    navigator.clipboard.writeText(hexColor);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
    toast({ title: 'Copied!', description: `${hexColor} copied to clipboard.`});
  };

  const rgbToHex = (rgb: string) => {
    const [r, g, b] = rgb.match(/\d+/g)!.map(Number);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  }

  const handleReset = () => {
    setImage(null);
    setPalette([]);
    setCurrentFile(null);
    setNumColors(6);
  }

  return (
    <>
    <div className="w-full">
        <Card className="w-full bg-card/50 backdrop-blur-lg border-border/20">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Palette /> Color Palette Extractor</CardTitle>
            <CardDescription>Upload an image to automatically extract a color palette.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            {!image && <FileDropzone onFileDrop={handleFileDrop} variant="purple"/>}
            {image && (
                <div className="space-y-4">
                    <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                        <Image src={image} alt="Uploaded" fill className="object-contain" />
                    </div>
                    <div className="flex justify-center">
                        <Button variant="outline" onClick={handleReset}>Upload another image</Button>
                    </div>
                </div>
            )}

            {isLoading && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="animate-spin h-6 w-6" />
                <span>Extracting Palette...</span>
            </div>
            )}
            
            {palette.length > 0 && (
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="color-count">Number of Colors: {numColors}</Label>
                    <Slider 
                      id="color-count" 
                      min={2} 
                      max={12} 
                      step={1} 
                      value={[numColors]} 
                      onValueChange={(val) => setNumColors(val[0])} 
                      onValueCommit={(val) => handleRegenerate(val[0])}
                      variant="purple"
                    />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {palette.map((color, index) => (
                    <div key={index} className="flex flex-col items-center gap-2">
                    <div className="w-full aspect-square rounded-md border" style={{ backgroundColor: color }}></div>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(color)}>
                        {copiedColor === color ? <Check className="text-green-500"/> : <Copy className="mr-2"/>}
                        {rgbToHex(color)}
                    </Button>
                    </div>
                ))}
                </div>
            </div>
            )}
        </CardContent>
        </Card>
    </div>
    <AdModal
        isOpen={isAdModalOpen}
        onClose={() => setIsAdModalOpen(false)}
        onAdFinish={handleAdFinish}
        title="Extracting your palette..."
        duration={15}
    />
    </>
  );
}
