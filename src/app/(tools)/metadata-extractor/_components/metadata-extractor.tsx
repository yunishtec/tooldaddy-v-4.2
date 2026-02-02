'use client';

import { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FileSearch, Loader2, Copy, Download, Trash2, ShieldOff } from 'lucide-react';
import FileDropzone from '@/components/file-dropzone';
import ExifReader from 'exifreader';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatBytes } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

type MetadataResult = {
  fileName: string;
  fileSize: number;
  tags: Record<string, any>;
  error?: string;
};

type ResultItem = {
    file: File;
    result: MetadataResult;
}

// Tags to exclude for a cleaner display
const EXCLUDED_TAGS = [
    'MakerNote', 'UserComment', 'Thumbnail', 'GPS', // These are often large or complex objects
];

export default function MetadataExtractor() {
  const [results, setResults] = useState<ResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileDrop = useCallback(async (files: File[]) => {
    setIsLoading(true);
    setResults([]);
    toast({
        title: 'Processing Files...',
        description: `Starting to extract metadata from ${files.length} file(s).`,
    });
    
    // Process files sequentially to avoid memory bloat with many large files.
    const newResults: ResultItem[] = [];
    for (const file of files) {
        try {
            const tags = await ExifReader.load(file);
            const result: MetadataResult = {
                fileName: file.name,
                fileSize: file.size,
                tags: tags,
            };
            if (Object.keys(tags).length === 0) {
                result.error = "No metadata found or file type not supported for metadata extraction.";
            }
            newResults.push({ file, result });
        } catch (error: any) {
            console.error("Metadata extraction error:", error);
            const errorResult: MetadataResult = {
                fileName: file.name,
                fileSize: file.size,
                tags: {},
                error: "Failed to read metadata. The file may be corrupted or in an unsupported format."
            };
            newResults.push({ file, result: errorResult });
        }
        // Update state after each file to provide progressive feedback
        setResults([...newResults]);
    }

    setIsLoading(false);
    toast({
        title: 'Extraction Complete',
        description: `Processed ${newResults.length} file(s).`,
    });
  }, [toast]);
  
  const handleClear = () => {
    setResults([]);
  };
  
  const handleCopyJson = (tags: Record<string, any>) => {
    navigator.clipboard.writeText(JSON.stringify(tags, null, 2));
    toast({ title: 'Copied!', description: 'Metadata copied to clipboard as JSON.' });
  };
  
  const handleDownloadJson = (fileName: string, tags: Record<string, any>) => {
    const blob = new Blob([JSON.stringify(tags, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const baseName = fileName.substring(0, fileName.lastIndexOf('.'));
    link.download = `${baseName || 'metadata'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: 'Downloaded!', description: 'Metadata saved as a JSON file.' });
  };

  const handleDownloadAllJson = () => {
    if (!results || results.length === 0) return;
    const allTags = results.map(item => ({ fileName: item.result.fileName, tags: item.result.tags, error: item.result.error }));
    const blob = new Blob([JSON.stringify(allTags, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `metadata-batch-export.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: 'Downloaded!', description: 'All metadata saved as a single JSON file.' });
  };

  const handleStripAndDownload = async (file: File) => {
    toast({ title: "Stripping metadata..."});
    try {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                toast({ title: "Error", description: "Could not process image.", variant: "destructive"});
                return;
            }
            ctx.drawImage(img, 0, 0);

            // Exporting from canvas inherently strips most metadata.
            // We'll export as PNG to preserve quality without re-compression artifacts from JPEG.
            canvas.toBlob((blob) => {
                if (!blob) {
                    toast({ title: "Error", description: "Failed to create clean image.", variant: "destructive"});
                    return;
                }
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                const baseName = file.name.substring(0, file.name.lastIndexOf('.'));
                link.download = `${baseName || 'image'}_clean.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                toast({ title: "Clean Image Downloaded!", description: "A version with metadata stripped has been saved."});
            }, 'image/png');
        };

        img.onerror = () => {
            toast({ title: "Error", description: "Could not load the image to strip metadata.", variant: "destructive"});
        }
    } catch (e) {
        console.error("Failed to strip metadata:", e);
        toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive"});
    }
  };
  
  const renderValue = (value: any) => {
    if (typeof value === 'object' && value.description) {
        return value.description;
    }
    if (Array.isArray(value) && value.every(item => typeof item === 'number')) {
        return value.join(', ');
    }
    if (typeof value === 'string' && value.length > 100) {
        return `${value.substring(0, 100)}...`;
    }
    return String(value);
  }

  return (
    <div className="w-full">
      <Card className="w-full bg-card/50 backdrop-blur-lg border-border/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSearch />
            Metadata Extractor
          </CardTitle>
          <CardDescription>
            Upload one or more files (e.g., images) to view internal metadata like EXIF tags.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {results.length === 0 && !isLoading && (
            <>
            <FileDropzone onFileDrop={handleFileDrop} variant="indigo" accept="image/jpeg,image/png,image/webp,image/tiff" multiple={true} />
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Pro Tip</AlertTitle>
                <AlertDescription>
                   You can drag and drop multiple files at once for batch processing. This tool is currently optimized for images.
                </AlertDescription>
            </Alert>
            </>
          )}

          {isLoading && results.length === 0 && (
            <div className="flex justify-center items-center h-48 border-2 border-dashed rounded-lg">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
                    <p className="mt-4 text-muted-foreground">Extracting metadata from files...</p>
                </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-4">
              <Accordion type="single" collapsible defaultValue="item-0" className="w-full">
                {results.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>
                      <div className="flex justify-between items-center w-full pr-4">
                        <span className="font-mono text-sm truncate">{item.result.fileName}</span>
                        <Badge variant={item.result.error ? "destructive" : "secondary"}>{formatBytes(item.result.fileSize)}</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {item.result.error ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>{item.result.error}</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleCopyJson(item.result.tags)}>
                              <Copy className="mr-2"/> Copy JSON
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDownloadJson(item.result.fileName, item.result.tags)}>
                              <Download className="mr-2"/> Download JSON
                            </Button>
                             <Button size="sm" variant="outline" onClick={() => handleStripAndDownload(item.file)}>
                              <ShieldOff className="mr-2"/> Strip & Download
                            </Button>
                          </div>
                          <ScrollArea className="h-[400px] border rounded-md">
                            <Table>
                              <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                                <TableRow>
                                  <TableHead className="w-[40%]">Tag Name</TableHead>
                                  <TableHead>Value</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {Object.entries(item.result.tags)
                                  .filter(([key]) => !EXCLUDED_TAGS.includes(key))
                                  .map(([key, value]) => (
                                  <TableRow key={key}>
                                    <TableCell className="font-medium">{key}</TableCell>
                                    <TableCell className="font-mono text-xs">{renderValue(value)}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </ScrollArea>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
               {isLoading && (
                <div className="flex items-center gap-2 text-muted-foreground justify-center">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing remaining files...</span>
                </div>
              )}
              <div className="text-center flex flex-wrap justify-center gap-4">
                 <Button variant="outline" onClick={handleDownloadAllJson}>
                    <Download className="mr-2" /> Download All as JSON
                 </Button>
                <Button variant="outline" onClick={handleClear}>
                  <Trash2 className="mr-2" /> Clear and start over
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
