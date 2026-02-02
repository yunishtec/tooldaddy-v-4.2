'use client';
import { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

interface ColorWheelProps {
  color: string;
  setColor: (color: string) => void;
  size?: number;
}

type Hsv = { h: number; s: number; v: number };

// Conversion functions
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  return { r, g, b };
}

function rgbToHsv({ r, g, b }: { r: number; g: number; b: number }): Hsv {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s, v };
}

function hsvToRgb({ h, s, v }: Hsv): { r: number; g: number; b: number } {
  let r = 0, g = 0, b = 0, i, f, p, q, t;
  h /= 360;
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function rgbToHex({ r, g, b }: {r:number, g:number, b:number}): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}


export function ColorWheel({ color, setColor, size = 200 }: ColorWheelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hsv, setHsv] = useState<Hsv>(() => rgbToHsv(hexToRgb(color)));
  const [isDraggingWheel, setIsDraggingWheel] = useState(false);
  const [isDraggingRing, setIsDraggingRing] = useState(false);
  const { toast } = useToast();

  const RING_WIDTH = 20;
  const WHEEL_RADIUS = size / 2 - RING_WIDTH / 2;
  const TOTAL_RADIUS = size / 2;

  // Draw the color wheel and brightness ring
  const draw = useCallback((ctx: CanvasRenderingContext2D, hsv: Hsv) => {
    ctx.clearRect(0, 0, size, size);

    // Draw Hue/Saturation wheel
    for (let angle = 0; angle < 360; angle++) {
      for (let dist = 0; dist < WHEEL_RADIUS; dist++) {
        const h = angle;
        const s = dist / WHEEL_RADIUS;
        const rgb = hsvToRgb({ h, s, v: hsv.v });
        ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        ctx.beginPath();
        ctx.arc(TOTAL_RADIUS, TOTAL_RADIUS, dist, (angle - 1) * Math.PI / 180, angle * Math.PI / 180);
        ctx.lineTo(TOTAL_RADIUS, TOTAL_RADIUS);
        ctx.fill();
      }
    }
    
    // Draw Brightness ring
    for (let angle = 0; angle < 360; angle++) {
        const h = hsv.h;
        const s = hsv.s;
        const v = angle / 360;
        const rgb = hsvToRgb({ h, s, v });
        ctx.strokeStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        ctx.beginPath();
        ctx.arc(TOTAL_RADIUS, TOTAL_RADIUS, WHEEL_RADIUS + RING_WIDTH / 2, (angle - 1) * Math.PI / 180, angle * Math.PI / 180);
        ctx.lineWidth = RING_WIDTH;
        ctx.stroke();
    }
    
    // Draw wheel border
    ctx.beginPath();
    ctx.arc(TOTAL_RADIUS, TOTAL_RADIUS, WHEEL_RADIUS, 0, 2 * Math.PI);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.stroke();

  }, [size, WHEEL_RADIUS, TOTAL_RADIUS]);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx && containerRef.current) {
        draw(ctx, hsv);
        containerRef.current.style.backgroundImage = `url(${canvas.toDataURL()})`;
    }
  }, [size, hsv, draw]);

  const updateColor = (newHsv: Hsv) => {
      setHsv(newHsv);
      const rgb = hsvToRgb(newHsv);
      setColor(rgbToHex(rgb));
  }

  const handleInteraction = useCallback((e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    const rect = containerRef.current!.getBoundingClientRect();
    const x = ('clientX' in e ? e.clientX : 0) - rect.left;
    const y = ('clientY' in e ? e.clientY : 0) - rect.top;

    const dx = x - TOTAL_RADIUS;
    const dy = y - TOTAL_RADIUS;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;

    if (isDraggingRing || (e.type === 'mousedown' && distance > WHEEL_RADIUS && distance <= TOTAL_RADIUS)) {
        const newV = angle / 360;
        updateColor({ ...hsv, v: newV });
    } else if (isDraggingWheel || (e.type === 'mousedown' && distance <= WHEEL_RADIUS)) {
        const saturation = Math.min(distance / WHEEL_RADIUS, 1);
        updateColor({ h: angle, s: saturation, v: hsv.v });
    }
  }, [TOTAL_RADIUS, WHEEL_RADIUS, hsv, isDraggingRing, isDraggingWheel, updateColor]);


  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dx = x - TOTAL_RADIUS;
    const dy = y - TOTAL_RADIUS;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > WHEEL_RADIUS && distance <= TOTAL_RADIUS) {
        setIsDraggingRing(true);
    } else if (distance <= WHEEL_RADIUS) {
        setIsDraggingWheel(true);
    }
    handleInteraction(e);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDraggingWheel || isDraggingRing) {
      handleInteraction(e);
    }
  }, [isDraggingWheel, isDraggingRing, handleInteraction]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingWheel(false);
    setIsDraggingRing(false);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(color);
    toast({ title: "Copied!", description: `${color} copied to clipboard.`});
  }

  // Calculate indicator positions
  const wheelIndicatorX = hsv.s * WHEEL_RADIUS * Math.cos(hsv.h * Math.PI / 180) + TOTAL_RADIUS;
  const wheelIndicatorY = hsv.s * WHEEL_RADIUS * Math.sin(hsv.h * Math.PI / 180) + TOTAL_RADIUS;

  const ringAngle = hsv.v * 360;
  const ringIndicatorX = (WHEEL_RADIUS + RING_WIDTH / 2) * Math.cos(ringAngle * Math.PI / 180) + TOTAL_RADIUS;
  const ringIndicatorY = (WHEEL_RADIUS + RING_WIDTH / 2) * Math.sin(ringAngle * Math.PI / 180) + TOTAL_RADIUS;

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={containerRef}
        className="relative rounded-full cursor-pointer"
        style={{ width: size, height: size }}
        onMouseDown={handleMouseDown}
      >
        <div
          className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={{
            left: wheelIndicatorX,
            top: wheelIndicatorY,
            backgroundColor: rgbToHex(hsvToRgb(hsv)),
          }}
        />
         <div
          className="absolute w-4 h-4 rounded-full border-2 border-white bg-transparent shadow-md pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={{
            left: ringIndicatorX,
            top: ringIndicatorY,
          }}
        />
      </div>
       <div className="flex items-center gap-2 border rounded-md p-2 w-full justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: color }}></div>
            <span className="font-mono text-sm">{color}</span>
          </div>
           <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
                <Copy className="h-4 w-4"/>
           </Button>
      </div>
    </div>
  );
}
