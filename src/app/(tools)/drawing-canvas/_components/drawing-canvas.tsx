
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Eraser, Trash2, Download, Palette, Minus, Circle, RectangleHorizontal, ArrowLeft, ArrowRight, Maximize, Minimize } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ColorWheel } from '@/components/color-wheel';
import AdModal from '@/components/ad-modal';


type Tool = 'pencil' | 'eraser' | 'line' | 'rectangle' | 'circle';

const CANVAS_BACKGROUND = '#000000';

export default function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tempCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [tool, setTool] = useState<Tool>('pencil');
  const [color, setColor] = useState('#FFFFFF');
  const [brushSize, setBrushSize] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number, y: number } | null>(null);
  const { toast } = useToast();

  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
  const [drawingFilename, setDrawingFilename] = useState('my-drawing');
  const [isFullScreen, setIsFullScreen] = useState(false);

  const [isAdModalOpen, setIsAdModalOpen] = useState(false);


  const getCanvasContext = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas) return null;
    return canvas.getContext('2d');
  }, []);

  const restoreState = useCallback((dataUrl: string, canvas: HTMLCanvasElement) => {
    const ctx = getCanvasContext(canvas);
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = dataUrl;
  }, [getCanvasContext]);
  
  const resizeCanvases = useCallback(() => {
    const container = containerRef.current;
    const mainCanvas = canvasRef.current;
    const tempCanvas = tempCanvasRef.current;

    if (!container || !mainCanvas || !tempCanvas) return;
    
    // --- BATCH READS ---
    const currentMainState = mainCanvas.toDataURL();
    const { width, height } = container.getBoundingClientRect();
    
    // --- BATCH WRITES ---
    mainCanvas.width = width;
    mainCanvas.height = height;
    tempCanvas.width = width;
    tempCanvas.height = height;

    // Restore state after resizing
    restoreState(currentMainState, mainCanvas);

  }, [restoreState]);

  useEffect(() => {
    const timer = setTimeout(() => {
      resizeCanvases();
    }, 100);
    return () => clearTimeout(timer);
  }, [isFullScreen, resizeCanvases]);


  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    setUndoStack((prev) => [...prev, dataUrl].slice(-20));
    setRedoStack([]);
  }, []);

  useEffect(() => {
    const mainCanvas = canvasRef.current;
    const tempCanvas = tempCanvasRef.current;
    const container = containerRef.current;

    const initializeCanvas = () => {
        if (!mainCanvas || !tempCanvas || !container) return;

        const { width, height } = container.getBoundingClientRect();
        
        mainCanvas.width = width;
        mainCanvas.height = height;
        tempCanvas.width = width;
        tempCanvas.height = height;

        const mainCtx = getCanvasContext(mainCanvas);
        if (mainCtx) {
            if (undoStack.length > 0) {
                restoreState(undoStack[undoStack.length - 1], mainCanvas);
            } else {
                mainCtx.fillStyle = CANVAS_BACKGROUND;
                mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
                const dataUrl = mainCanvas.toDataURL();
                setUndoStack([dataUrl]);
            }
        }
    };
    
    initializeCanvas();

    window.addEventListener('resize', resizeCanvases);
    return () => {
        window.removeEventListener('resize', resizeCanvases);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUndo = useCallback(() => {
    if (undoStack.length <= 1) return;
    
    const currentState = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [currentState, ...prev]);

    const prevState = undoStack[undoStack.length - 2];
    setUndoStack((prev) => prev.slice(0, -1));
    
    if (canvasRef.current) {
        restoreState(prevState, canvasRef.current);
    }

  }, [undoStack, redoStack, restoreState]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    
    const nextState = redoStack[0];
    setUndoStack((prev) => [...prev, nextState]);
    setRedoStack((prev) => prev.slice(1));
    
    if (canvasRef.current) {
        restoreState(nextState, canvasRef.current);
    }

  }, [redoStack, restoreState, undoStack]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'z') {
                e.preventDefault();
                if (e.shiftKey) {
                    handleRedo();
                } else {
                    handleUndo();
                }
            } else if (e.key === 'y') {
                e.preventDefault();
                handleRedo();
            }
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleUndo, handleRedo]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = e.nativeEvent;
    
    setIsDrawing(true);
    setStartPos({ x: offsetX, y: offsetY });
    
    const mainCtx = getCanvasContext(canvasRef.current);
    if (!mainCtx) return;

    if (tool === 'pencil' || tool === 'eraser') {
      mainCtx.beginPath();
      mainCtx.moveTo(offsetX, offsetY);
      mainCtx.lineWidth = brushSize;
      mainCtx.lineCap = 'round';
      mainCtx.lineJoin = 'round';
      mainCtx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
      mainCtx.strokeStyle = tool === 'eraser' ? 'rgba(0,0,0,1)' : color;
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return;

    const { offsetX, offsetY } = e.nativeEvent;

    if (tool === 'pencil' || tool === 'eraser') {
      const mainCtx = getCanvasContext(canvasRef.current);
      if(!mainCtx) return;
      mainCtx.lineTo(offsetX, offsetY);
      mainCtx.stroke();
    } else {
        const tempCtx = getCanvasContext(tempCanvasRef.current);
        if (!tempCtx || !tempCanvasRef.current) return;
        
        tempCtx.clearRect(0, 0, tempCanvasRef.current.width, tempCanvasRef.current.height);
        tempCtx.lineWidth = brushSize;
        tempCtx.strokeStyle = color;
        tempCtx.fillStyle = color;
        tempCtx.lineCap = 'round';
        tempCtx.lineJoin = 'round';
        
        tempCtx.beginPath();
        switch(tool) {
            case 'line':
                tempCtx.moveTo(startPos.x, startPos.y);
                tempCtx.lineTo(offsetX, offsetY);
                break;
            case 'rectangle':
                tempCtx.rect(startPos.x, startPos.y, offsetX - startPos.x, offsetY - startPos.y);
                break;
            case 'circle':
                 const radiusX = Math.abs(offsetX - startPos.x) / 2;
                 const radiusY = Math.abs(offsetY - startPos.y) / 2;
                 const centerX = startPos.x + (offsetX - startPos.x) / 2;
                 const centerY = startPos.y + (offsetY - startPos.y) / 2;
                 tempCtx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
                 break;
        }
        tempCtx.stroke();
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return;
    const mainCtx = getCanvasContext(canvasRef.current);
    const tempCtx = getCanvasContext(tempCanvasRef.current);
    if (!mainCtx || !tempCtx || !tempCanvasRef.current) return;

    const { offsetX, offsetY } = e.nativeEvent;

    if (tool === 'pencil' || tool === 'eraser') {
      mainCtx.closePath();
    } else {
        tempCtx.clearRect(0, 0, tempCanvasRef.current.width, tempCanvasRef.current.height);

        mainCtx.lineWidth = brushSize;
        mainCtx.strokeStyle = color;
        mainCtx.fillStyle = color;
        mainCtx.globalCompositeOperation = 'source-over';
        mainCtx.lineCap = 'round';
        mainCtx.lineJoin = 'round';
        
        mainCtx.beginPath();
        switch(tool) {
            case 'line':
                mainCtx.moveTo(startPos.x, startPos.y);
                mainCtx.lineTo(offsetX, offsetY);
                break;
            case 'rectangle':
                mainCtx.rect(startPos.x, startPos.y, offsetX - startPos.x, offsetY - startPos.y);
                break;
            case 'circle':
                 const radiusX = Math.abs(offsetX - startPos.x) / 2;
                 const radiusY = Math.abs(offsetY - startPos.y) / 2;
                 const centerX = startPos.x + (offsetX - startPos.x) / 2;
                 const centerY = startPos.y + (offsetY - startPos.y) / 2;
                 mainCtx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
                 break;
        }
        mainCtx.stroke();
    }

    saveState();
    setIsDrawing(false);
    setStartPos(null);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = getCanvasContext(canvas);
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = CANVAS_BACKGROUND;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
    toast({ title: 'Canvas Cleared' });
  };

  const downloadImage = () => {
    setIsDownloadDialogOpen(false);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${drawingFilename || 'drawing'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast({ title: 'Image Saved!' });
  };
  
  const handleAdFinish = () => {
    setIsAdModalOpen(false);
    setIsDownloadDialogOpen(true);
  }

  return (
    <>
    <div className={cn("w-full h-full flex flex-col p-4 md:p-6", isFullScreen && "p-0 md:p-0")}>
      <Card className={cn(
          "w-full h-full flex flex-col bg-card/50 backdrop-blur-lg border-border/20 transition-all duration-300",
          isFullScreen && "fixed inset-0 z-40 rounded-none border-none"
        )}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Pencil /> Drawing Canvas</CardTitle>
          <CardDescription>A minimalist canvas for your quick sketches and notes.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 flex-grow">
          <div className="flex flex-wrap items-center justify-center gap-2 border rounded-lg p-2 bg-background">
            
            <Button variant={tool === 'pencil' ? 'cyan' : 'ghost'} size="icon" onClick={() => setTool('pencil')} title="Pencil">
              <Pencil />
            </Button>
            <Button variant={tool === 'eraser' ? 'cyan' : 'ghost'} size="icon" onClick={() => setTool('eraser')} title="Eraser">
              <Eraser />
            </Button>
             
            <div className="w-[1px] h-8 bg-border mx-2"></div>

             <Button variant={tool === 'line' ? 'cyan' : 'ghost'} size="icon" onClick={() => setTool('line')} title="Line">
              <Minus />
            </Button>
             <Button variant={tool === 'rectangle' ? 'cyan' : 'ghost'} size="icon" onClick={() => setTool('rectangle')} title="Rectangle">
              <RectangleHorizontal />
            </Button>
             <Button variant={tool === 'circle' ? 'cyan' : 'ghost'} size="icon" onClick={() => setTool('circle')} title="Circle">
              <Circle />
            </Button>
            
            <div className="w-[1px] h-8 bg-border mx-2"></div>
            
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" title="Select Color">
                         <Palette style={{ color: color }}/>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4 rounded-xl">
                    <ColorWheel color={color} setColor={setColor} />
                </PopoverContent>
            </Popover>

            <div className="w-48 px-4">
                <Label>Brush Size: {brushSize}px</Label>
                <Slider min={1} max={40} value={[brushSize]} onValueChange={(val) => setBrushSize(val[0])} variant="cyan"/>
            </div>

            <div className="flex-grow"></div>

            <Button variant="outline" onClick={handleUndo} disabled={undoStack.length <= 1} title="Undo (Ctrl+Z)">
                <ArrowLeft/>
            </Button>
            <Button variant="outline" onClick={handleRedo} disabled={redoStack.length === 0} title="Redo (Ctrl+Y)">
                <ArrowRight/>
            </Button>
            <Button variant="outline" onClick={clearCanvas} title="Clear Canvas">
              <Trash2 className="mr-2" /> Clear
            </Button>
            
            <Dialog open={isDownloadDialogOpen} onOpenChange={setIsDownloadDialogOpen}>
              <DialogTrigger asChild>
                 <Button variant="cyan" title="Download Image" onClick={() => setIsAdModalOpen(true)}>
                  <Download className="mr-2" /> Download
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Name Your Drawing</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="filename" className="text-right">Filename</Label>
                    <Input id="filename" value={drawingFilename} onChange={(e) => setDrawingFilename(e.target.value)} className="col-span-3" onKeyDown={(e) => {if (e.key === 'Enter') downloadImage()}} />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={downloadImage}>
                    <Download className="mr-2" /> Download
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

          </div>
          <div ref={containerRef} className="border rounded-lg overflow-auto flex-grow relative bg-black min-h-[400px]" style={{ touchAction: 'none' }} >
             <canvas
                ref={canvasRef}
                className="absolute top-0 left-0"
            />
             <canvas
                ref={tempCanvasRef}
                className={cn("absolute top-0 left-0")}
                style={{ cursor: 'crosshair' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
            />
          </div>
        </CardContent>
         <CardFooter className="justify-end flex-shrink-0">
             <Button variant="ghost" size="icon" onClick={() => setIsFullScreen(!isFullScreen)} className="z-50">
                {isFullScreen ? <Minimize /> : <Maximize />}
                <span className="sr-only">{isFullScreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}</span>
            </Button>
        </CardFooter>
      </Card>
    </div>
    <AdModal
      isOpen={isAdModalOpen}
      onClose={() => setIsAdModalOpen(false)}
      onAdFinish={handleAdFinish}
      title="Preparing your download..."
      duration={10}
    />
    </>
  );
}
