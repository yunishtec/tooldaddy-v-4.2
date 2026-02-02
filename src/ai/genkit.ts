import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import fs from 'fs';
import path from 'path';

function loadApiKey(flowName?: string): string | undefined {
  // Priority 1: Flow-specific environment variables
  if (flowName === 'humanizer' && process.env.HUMANIZER_API_KEY) {
    console.log(' Humanizer API key loaded from HUMANIZER_API_KEY');
    return process.env.HUMANIZER_API_KEY;
  }
  if (flowName === 'playlist' && process.env.PLAYLIST_MAKER_API_KEY) {
    console.log(' Playlist Maker API key loaded from PLAYLIST_MAKER_API_KEY');
    return process.env.PLAYLIST_MAKER_API_KEY;
  }

  // Priority 2: General Gemini API key
  const envKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (envKey) {
    console.log(' Gemini API key loaded from environment variables');
    return envKey;
  }

  // Priority 3: Fallback to local file (development only, requires api-keys.json)
  try {
    const filePath = path.resolve(process.cwd(), 'src', 'ai', 'api-keys.json');
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    const fileKey = parsed?.keys?.[0]?.gemini?.apiKey;
    if (fileKey) {
      console.warn('  Gemini API key loaded from file; use environment variables for production');
      return fileKey;
    }
  } catch (e) {
    // Silently continue if file doesn't exist
  }

  // No key found
  console.error(' ERROR: Gemini API key not found! Set GEMINI_API_KEY or GOOGLE_API_KEY environment variable.');
  return undefined;
}

const geminiKey = loadApiKey();

// Create AI instance with default key
export const ai = genkit({
  plugins: [googleAI({ apiKey: geminiKey })],
  model: 'googleai/gemini-2.5-flash',
});

// Create specialized instances for specific flows
export function createFlowAi(flowName: string) {
  const flowKey = loadApiKey(flowName);
  return genkit({
    plugins: [googleAI({ apiKey: flowKey || geminiKey })],
    model: 'googleai/gemini-2.5-flash',
  });
}
