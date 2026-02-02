'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, Trash2, Bot, Sparkles, Minimize, Replace, QrCode, Music, Video, Download } from 'lucide-react';
import { useHistory } from '@/hooks/use-history';
import { formatBytes, getFileExtension, cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const toolIcons: { [key: string]: React.ElementType } = {
  'AI Image Enhancer': Sparkles,
  'AI Text Humanizer': Bot,
  'Image Compressor': Minimize,
  'Image Converter': Replace,
  'QR Code Generator': QrCode,
  'Video to Audio Converter': Music,
  'Video Compressor': Video,
  'YouTube Video Downloader': Download,
  'YouTube to Audio': Music,
};


export default function HistoryPage() {
  const { history, isLoaded, clearHistory } = useHistory();

  const handleDownload = (dataUrl: string, filename: string) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full space-y-6">
      <Card className="bg-card/50 backdrop-blur-lg border-border/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="w-6 h-6" />
            History
          </CardTitle>
          {history.length > 0 && (
             <Button variant="outline" size="sm" onClick={clearHistory}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear History
            </Button>
          )}
        </CardHeader>
      </Card>

      {!isLoaded && (
         <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Loading history...</p>
        </div>
      )}

      {isLoaded && history.length === 0 && (
         <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Your history is empty.</p>
            <p className="text-sm text-muted-foreground/80">Creations from the tools will appear here.</p>
        </div>
      )}

      {isLoaded && history.length > 0 && (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {history.map((item) => {
            const Icon = toolIcons[item.tool] || History;
            return (
              <Card key={item.id} className="flex flex-col bg-card/50 backdrop-blur-lg border-border/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon className="w-5 h-5 text-primary"/>
                    {item.tool}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                  </p>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  {item.tool === 'AI Image Enhancer' && item.data.enhancedImage && (
                    <div className="space-y-2">
                        <div className="relative w-full aspect-square rounded-md overflow-hidden border">
                            <Image src={item.data.enhancedImage} alt="Enhanced" fill className="object-contain"/>
                        </div>
                         <Button onClick={() => handleDownload(item.data.enhancedImage!, `enhanced-image.${getFileExtension(item.data.fileType)}`)} variant="secondary" size="sm" className="w-full">Download</Button>
                    </div>
                  )}
                  {item.tool === 'Image Compressor' && item.data.compressedImage && (
                    <div className="space-y-2">
                        <div className="relative w-full aspect-square rounded-md overflow-hidden border">
                            <Image src={item.data.compressedImage} alt="Compressed" fill className="object-contain"/>
                        </div>
                        <Alert>
                            <AlertDescription className="text-center">
                                Compressed from {formatBytes(item.data.originalSize || 0)} to {formatBytes(item.data.compressedSize || 0)}
                            </AlertDescription>
                        </Alert>
                         <Button onClick={() => handleDownload(item.data.compressedImage!, `compressed-image.${getFileExtension(item.data.fileType)}`)} variant="secondary" size="sm" className="w-full">Download</Button>
                    </div>
                  )}
                   {item.tool === 'Image Converter' && item.data.convertedImage && (
                    <div className="space-y-2">
                        <div className="relative w-full aspect-square rounded-md overflow-hidden border">
                            <Image src={item.data.convertedImage} alt="Converted" fill className="object-contain"/>
                        </div>
                        <Alert>
                            <AlertDescription className="text-center">
                                Converted from {item.data.originalFormat?.toUpperCase()} to {item.data.targetFormat?.toUpperCase()}
                            </AlertDescription>
                        </Alert>
                         <Button onClick={() => handleDownload(item.data.convertedImage!, `converted-image.${item.data.targetFormat}`)} variant="secondary" size="sm" className="w-full">Download</Button>
                    </div>
                  )}
                   {item.tool === 'QR Code Generator' && item.data.qrCodeImage && (
                    <div className="space-y-2 text-center">
                        <div className="p-4 bg-white rounded-lg border inline-block">
                             <Image src={item.data.qrCodeImage} alt="QR Code" width={128} height={128} />
                        </div>
                        <p className="text-xs text-muted-foreground truncate" title={item.data.qrCodeText}>{item.data.qrCodeText}</p>
                         <Button onClick={() => handleDownload(item.data.qrCodeImage!, `qrcode.png`)} variant="secondary" size="sm" className="w-full">Download</Button>
                    </div>
                  )}
                  {item.tool === 'AI Text Humanizer' && item.data.humanizedText && (
                      <div className="space-y-2">
                          <p className="text-sm p-3 bg-muted/50 rounded-md max-h-40 overflow-y-auto">{item.data.humanizedText}</p>
                      </div>
                  )}
                   {item.tool === 'Video to Audio Converter' && item.data.videoFileName && (
                    <div className="space-y-2">
                         <Alert>
                            <AlertTitle className="text-center text-sm">{item.data.videoFileName}</AlertTitle>
                            <AlertDescription className="text-center">
                                Converted video of size {formatBytes(item.data.videoFileSize || 0)}
                            </AlertDescription>
                        </Alert>
                        {item.data.extractedAudio ? (
                            <>
                                <audio controls src={item.data.extractedAudio} className="w-full"></audio>
                                <Button onClick={() => handleDownload(item.data.extractedAudio!, `${item.data.videoFileName?.split('.')[0] || 'audio'}.mp3`)} variant="secondary" size="sm" className="w-full">Download MP3</Button>
                            </>
                        ) : (
                            <div className="text-center p-4">
                                <Music className="w-16 h-16 mx-auto text-muted-foreground" />
                                <p className="text-xs mt-2">Audio not stored in history to save space.</p>
                            </div>
                        )}
                    </div>
                  )}
                  {item.tool === 'Video Compressor' && item.data.videoFileName && (
                    <div className="space-y-2">
                         <Alert>
                            <AlertTitle className="text-center text-sm">{item.data.videoFileName}</AlertTitle>
                            <AlertDescription className="text-center">
                                Compressed from {formatBytes(item.data.originalSize || 0)} to {formatBytes(item.data.compressedSize || 0)}
                            </AlertDescription>
                        </Alert>
                        <div className="text-center p-4">
                            <Video className="w-16 h-16 mx-auto text-muted-foreground" />
                            <p className="text-xs mt-2">Video compression history does not store the video itself.</p>
                        </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  );
}
