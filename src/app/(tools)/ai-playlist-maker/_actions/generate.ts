'use server';

import { generatePlaylist, type PlaylistInput, type PlaylistOutput } from '@/ai/flows/generate-playlist';

export async function generatePlaylistAction(input: PlaylistInput): Promise<PlaylistOutput> {
  try {
    const result = await generatePlaylist(input);
    return result;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to generate playlist');
  }
}
