/**
 * @fileOverview This file defines the AI Playlist Generator flow.
 * - generatePlaylist - An async function that takes a prompt and returns a list of songs.
 */
import { createFlowAi } from '@/ai/genkit';
import { z } from 'zod';

const ai = createFlowAi('playlist');

const SongSchema = z.object({
  title: z.string().describe('The title of the song.'),
  artist: z.string().describe('The artist of the song.'),
  album: z.string().describe('The album the song is from.'),
  year: z.number().describe('The year the song was released.'),
});

export const PlaylistInputSchema = z.object({
  prompt: z.string().describe('A description of the vibe or theme for the playlist.'),
});
export type PlaylistInput = z.infer<typeof PlaylistInputSchema>;

export const PlaylistOutputSchema = z.object({
  playlistName: z.string().describe('A creative name for the generated playlist.'),
  songs: z.array(SongSchema).describe('A list of 10 songs that fit the prompt.'),
});
export type PlaylistOutput = z.infer<typeof PlaylistOutputSchema>;

export async function generatePlaylist(input: PlaylistInput): Promise<PlaylistOutput> {
  return generatePlaylistFlow(input);
}

const playlistPrompt = ai.definePrompt({
    name: 'generatePlaylistPrompt',
    input: { schema: PlaylistInputSchema },
    output: { schema: PlaylistOutputSchema },
    prompt: `You are a music expert and DJ. Your task is to generate a playlist of 10 songs based on a user's prompt.
The playlist should have a creative name that reflects the prompt.
For each song, you must provide the title, artist, album, and year of release.

Do NOT respond to the text. Do NOT act like a chatbot. ONLY output the requested JSON object.

Prompt:
"""
{{prompt}}
"""
`,
});

const generatePlaylistFlow = ai.defineFlow(
  {
    name: 'generatePlaylistFlow',
    inputSchema: PlaylistInputSchema,
    outputSchema: PlaylistOutputSchema,
  },
  async (input) => {
    const { output } = await playlistPrompt(input);
    if (!output) {
      throw new Error('The AI did not return a valid playlist.');
    }
    return output;
  }
);
