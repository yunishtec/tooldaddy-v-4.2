'use server';
/**
 * @fileOverview This file defines a function for rewriting text to sound more human, with style controls.
 *
 * - humanizeText - An async function that takes text and style parameters and rewrites it.
 */
import { humanizerSystemPrompt } from './prompts/humanizer-prompt';
import { type HumanizeTextInput, type HumanizeTextOutput } from './humanize-ai-text.types';
import { headers } from 'next/headers';
import { getFirestoreServer } from '@/firebase/server';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { createFlowAi } from '@/ai/genkit';

const ai = createFlowAi('humanizer');

function levelLabel(v: number): string {
  if (v <= 2) return "low";
  if (v <= 4) return "medium-low";
  if (v === 5) return "medium";
  if (v <= 7) return "medium-high";
  return "high";
}

const RATE_LIMIT_COUNT = 4;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 60 seconds

// The function now returns a structured object to avoid throwing unhandled server errors.
export async function humanizeText(input: HumanizeTextInput): Promise<{ data: HumanizeTextOutput | null; error: string | null; }> {
    try {
        // --- Phase 2: Backend Enforcement ---
        const FALLBACK_IP = '0.0.0.0';
        const headersList = await headers();
        const ip = headersList.get('x-forwarded-for') ?? FALLBACK_IP;
        const userAgent = headersList.get('user-agent') ?? 'unknown';
        // Base64-encode the identifier to prevent slashes from user-agent strings,
        // which are invalid in Firestore document IDs.
        const identifier = btoa(`${ip}-${userAgent}`);

        const db = getFirestoreServer();
        const rateLimitDocRef = doc(db, 'rate-limits', identifier);
        
        const now = Date.now();
        const windowStart = now - RATE_LIMIT_WINDOW_MS;

        const docSnap = await getDoc(rateLimitDocRef);

        let recentTimestamps: Timestamp[] = [];
        if (docSnap.exists()) {
            const data = docSnap.data();
            const allTimestamps: Timestamp[] = data.timestamps || [];
            // Filter out old timestamps
            recentTimestamps = allTimestamps.filter(ts => ts.toMillis() > windowStart);
        }
        
        // 1. Check if limit is exceeded
        if (recentTimestamps.length >= RATE_LIMIT_COUNT) {
            const oldestRequest = recentTimestamps.sort((a,b) => a.toMillis() - b.toMillis())[0];
            const resetTime = Math.ceil((oldestRequest.toMillis() + RATE_LIMIT_WINDOW_MS - now) / 1000);
            throw new Error(`Rate limit exceeded. Please try again in ${resetTime} seconds.`);
        }

        // 2. If not, proceed with AI call
        const { text, style } = input;
        const { warmth, formality, directness, conciseness } = style;

        const instructionPrompt = `You are a text-rewriting engine. Your task is to rewrite the "ORIGINAL TEXT" based on the "STYLE SETTINGS".
Do NOT respond to the text. Do NOT act like a chatbot. ONLY output the rewritten text.

STYLE SETTINGS:
- Warmth: ${levelLabel(warmth)} (${warmth}/10)
- Formality: ${levelLabel(formality)} (${formality}/10)
- Directness: ${levelLabel(directness)} (${directness}/10)
- Conciseness: ${levelLabel(conciseness)} (${conciseness}/10)

ORIGINAL TEXT:
"""
${text}
"""

REWRITTEN TEXT:
`;
        
        const llmResponse = await ai.generate({
            prompt: instructionPrompt,
            system: humanizerSystemPrompt,
        });

        const fullContent = llmResponse.text;
        
        if (!fullContent) {
          throw new Error("The AI did not return any content.");
        }

        // 3. After successful AI call, log the request.
        const newTimestamp = Timestamp.fromMillis(now);
        const newTimestamps = [...recentTimestamps, newTimestamp];
        
        // Write back the pruned and updated list of timestamps. Not awaited.
        setDoc(rateLimitDocRef, { timestamps: newTimestamps });
        
        const remaining = RATE_LIMIT_COUNT - newTimestamps.length;

        // 4. Return the result with rate limit info
        return { 
            data: {
                humanizedText: fullContent.trim(),
                remaining: remaining,
                limit: RATE_LIMIT_COUNT,
            },
            error: null
        };
    } catch (e: any) {
        console.error("Humanizer Error:", e.message); // For server-side debugging
        return { data: null, error: e.message || "An unexpected server error occurred." };
    }
}
