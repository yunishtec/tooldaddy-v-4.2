
'use client';
import { useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { UploadCloud } from 'lucide-react';
import { cva, type VariantProps } from "class-variance-authority"


const fileDropzoneVariants = cva(
  'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors duration-200',
  {
    variants: {
      variant: {
        default: 'border-muted-foreground/30 hover:border-primary hover:bg-primary/5 data-[drag-over=true]:border-primary data-[drag-over=true]:bg-primary/10',
        blue: 'border-blue-500/30 hover:border-blue-500 hover:bg-blue-500/5 data-[drag-over=true]:border-blue-500 data-[drag-over=true]:bg-blue-500/10',
        green: 'border-green-500/30 hover:border-green-500 hover:bg-green-500/5 data-[drag-over=true]:border-green-500 data-[drag-over=true]:bg-green-500/10',
        yellow: 'border-yellow-500/30 hover:border-yellow-500 hover:bg-yellow-500/5 data-[drag-over=true]:border-yellow-500 data-[drag-over=true]:bg-yellow-500/10',
        purple: 'border-purple-500/30 hover:border-purple-500 hover:bg-purple-500/5 data-[drag-over=true]:border-purple-500 data-[drag-over=true]:bg-purple-500/10',
        pink: 'border-pink-500/30 hover:border-pink-500 hover:bg-pink-500/5 data-[drag-over=true]:border-pink-500 data-[drag-over=true]:bg-pink-500/10',
        indigo: 'border-indigo-500/30 hover:border-indigo-500 hover:bg-indigo-500/5 data-[drag-over=true]:border-indigo-500 data-[drag-over=true]:bg-indigo-500/10',
        red: 'border-red-500/30 hover:border-red-500 hover:bg-red-500/5 data-[drag-over=true]:border-red-500 data-[drag-over=true]:bg-red-500/10',
        cyan: 'border-cyan-500/30 hover:border-cyan-500 hover:bg-cyan-500/5 data-[drag-over=true]:border-cyan-500 data-[drag-over=true]:bg-cyan-500/10',
        orange: 'border-orange-500/30 hover:border-orange-500 hover:bg-orange-500/5 data-[drag-over=true]:border-orange-500 data-[drag-over=true]:bg-orange-500/10',
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);


interface FileDropzoneProps extends VariantProps<typeof fileDropzoneVariants> {
  onFileDrop: (files: File[]) => void;
  className?: string;
  accept?: string;
  multiple?: boolean;
}

export default function FileDropzone({
  onFileDrop,
  className,
  variant,
  accept = 'image/*',
  multiple = false,
}: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    handleDrag(e);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, [handleDrag]);

  const handleDragOut = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    handleDrag(e);
    setIsDragOver(false);
  }, [handleDrag]);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      handleDrag(e);
      setIsDragOver(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onFileDrop(Array.from(e.dataTransfer.files));
        e.dataTransfer.clearData();
      }
    },
    [handleDrag, onFileDrop]
  );
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileDrop(Array.from(e.target.files));
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={cn(fileDropzoneVariants({ variant, className }))}
      data-drag-over={isDragOver}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={openFileDialog}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        accept={accept}
        multiple={multiple}
      />
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <UploadCloud className="h-10 w-10" />
        <p className="font-semibold">
          Drag & drop your file(s) here, or click to select
        </p>
        <p className="text-xs">
          Supports various file formats depending on the tool.
        </p>
      </div>
    </div>
  );
}
