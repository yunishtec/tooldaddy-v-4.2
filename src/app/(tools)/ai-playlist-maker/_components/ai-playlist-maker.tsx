'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, Music, Play, X } from 'lucide-react';
import { type PlaylistOutput } from '@/ai/flows/generate-playlist';
import { generatePlaylistAction } from '../_actions/generate';
import Image from 'next/image';
import AdModal from '@/components/ad-modal';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface NowPlaying {
  title: string;
  artist: string;
}

export default function AiPlaylistMaker() {
  const [prompt, setPrompt] = useState('');
  const [playlist, setPlaylist] = useState<PlaylistOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);

  // Helper function to generate YouTube Music search URL for direct music videos
  const getYoutubeSearchUrl = (title: string, artist: string) => {
    const query = `${title} ${artist}`;
    // Use YouTube Music for better music video results
    return `https://music.youtube.com/search?q=${encodeURIComponent(query)}`;
  };

  // Handle playing a song
  const handlePlaySong = (title: string, artist: string) => {
    setNowPlaying({ title, artist });
  };

  // Generate YouTube Music embed URL
  const getYouTubeMusicEmbedUrl = (title: string, artist: string) => {
    const query = encodeURIComponent(`${title} ${artist}`);
    // Direct link to YouTube Music search
    return `https://music.youtube.com/search?q=${query}`;
  };

  const handleGenerateClick = () => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt Required',
        description: 'Please enter a vibe or theme for your playlist.',
        variant: 'destructive',
      });
      return;
    }
    setIsAdModalOpen(true);
  };

  const performGeneration = async () => {
    setIsLoading(true);
    setPlaylist(null);

    try {
      const result = await generatePlaylistAction({ prompt });
      setPlaylist(result);
    } catch (error: any) {
      console.error('Error generating playlist:', error);
      toast({
        title: 'An Error Occurred',
        description: error.message || 'Failed to generate playlist. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdFinish = async () => {
    setIsAdModalOpen(false);
    await performGeneration();
  };
  
  const examplePrompts = [
    "Rainy day coding session",
    "80s synthwave driving at night",
    "Chill lofi beats for studying",
    "Acoustic coffee shop vibes",
    "High-energy workout mix"
  ];

  return (
    <>
      <div className="w-full h-full flex flex-col xl:flex-row gap-6">
        <div className="flex-1 flex flex-col gap-6">
          <Card className="flex-grow flex flex-col bg-card/50 backdrop-blur-lg border-border/20">
            <CardHeader>
              <CardTitle>AI Playlist Maker</CardTitle>
              <CardDescription>
                Describe a mood, vibe, or theme, and let AI create the perfect playlist for you.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col space-y-4">
              <Textarea
                placeholder="e.g., 'A workout playlist with 90s hip-hop hits' or 'sad songs for walking in the rain'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="h-full resize-none min-h-[150px]"
                disabled={isLoading}
              />
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Or try an example:</p>
                <div className="flex flex-wrap gap-2">
                    {examplePrompts.map(p => (
                        <Button key={p} variant="outline" size="sm" onClick={() => setPrompt(p)} disabled={isLoading}>
                            {p}
                        </Button>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
          <Button onClick={handleGenerateClick} disabled={isLoading} variant="purple" size="lg" className="w-full">
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-5 w-5" />
            )}
            Generate Playlist
          </Button>
        </div>

        <Card className="flex-1 flex flex-col bg-background/80 border-border/20">
          <CardHeader>
            <CardTitle>{playlist?.playlistName || 'Your Playlist'}</CardTitle>
            <CardDescription>
              {playlist ? 'Here are the songs for your listening pleasure.' : 'Your generated playlist will appear here.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col">
            <div className="relative flex-grow">
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 rounded-lg">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
                  <p className="mt-4 text-muted-foreground">Crafting your playlist...</p>
                </div>
              )}
              {!isLoading && !playlist && (
                 <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed rounded-lg p-8">
                    <Music className="h-12 w-12 mb-4" />
                    <p className="font-semibold">Ready for some tunes?</p>
                    <p className="text-sm">Enter a prompt and hit generate!</p>
                </div>
              )}
              {playlist && (
                <ScrollArea className="h-full max-h-[600px] pr-4">
                  <ul className="space-y-4">
                    {playlist.songs.map((song, index) => (
                      <li key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-purple-500/10 transition-all hover:border-purple-500/50 border border-transparent">
                        <div className="relative group flex-shrink-0 cursor-pointer" onClick={() => handlePlaySong(song.title, song.artist)}>
                          <Image
                            src={`https://picsum.photos/seed/${song.title.replace(/\s/g, '')}/${100}/${100}`}
                            data-ai-hint={`${song.album} album cover`}
                            alt={`${song.album} album art`}
                            width={64}
                            height={64}
                            className="rounded-md"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/50 rounded-md transition-colors">
                            <Play className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity fill-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{song.title}</p>
                          <p className="text-sm text-muted-foreground">{song.artist}</p>
                          <p className="text-xs text-muted-foreground/80">{song.album} ({song.year})</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePlaySong(song.title, song.artist)}
                          className="flex-shrink-0 hover:bg-purple-500/20 hover:border-purple-500 hover:text-purple-400 transition-colors"
                        >
                          <Play className="h-4 w-4 mr-1 fill-current" />
                          Play
                        </Button>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AdModal
        isOpen={isAdModalOpen}
        onClose={() => setIsAdModalOpen(false)}
        onAdFinish={handleAdFinish}
        title="Generating your playlist..."
        duration={5}
      />

      {/* YouTube Player Modal */}
      <Dialog open={!!nowPlaying} onOpenChange={(open) => !open && setNowPlaying(null)}>
        <DialogContent className="w-full max-w-4xl h-[90vh] max-h-[900px] p-0 border-0 bg-background">
          <DialogHeader className="sr-only">
            <DialogTitle>Now Playing: {nowPlaying?.title}</DialogTitle>
          </DialogHeader>
          {nowPlaying && (
            <div className="w-full h-full flex flex-col bg-background rounded-lg overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/20 to-purple-500/10 border-b border-border/20">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-foreground truncate">{nowPlaying.title}</h3>
                  <p className="text-sm text-muted-foreground truncate">{nowPlaying.artist}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setNowPlaying(null)}
                  className="ml-2 hover:bg-purple-500/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* YouTube Music Embed */}
              <div className="flex-1 w-full overflow-hidden bg-background">
                <iframe
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                  src={`https://www.youtube.com/embed/?listType=search&list=${encodeURIComponent(`${nowPlaying.title} ${nowPlaying.artist}`)}`}
                  title={`${nowPlaying.title} by ${nowPlaying.artist}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Fallback Button */}
              <div className="p-4 border-t border-border/20 bg-background/50 flex gap-2">
                <p className="text-sm text-muted-foreground flex-1">Having trouble playing? </p>
                <a
                  href={getYouTubeMusicEmbedUrl(nowPlaying.title, nowPlaying.artist)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm" variant="outline" className="hover:bg-purple-500/20">
                    Open in YouTube Music
                  </Button>
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
