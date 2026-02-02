
/**
 * @fileOverview This file defines the types for the AI Text Humanizer flow.
 */
import { z } from 'zod';

export const HumanizeTextInputSchema = z.object({
  text: z.string().describe('The AI-generated text to humanize.'),
  style: z.object({
    warmth: z.number().min(0).max(10).describe('Controls friendliness and empathy.'),
    formality: z.number().min(0).max(10).describe('Controls casual vs professional wording.'),
    directness: z.number().min(0).max(10).describe('Controls blunt vs gentle language.'),
    conciseness: z.number().min(0).max(10).describe('Controls the length and detail of the output.'),
  }).describe('The desired style of the humanized text.'),
});
export type HumanizeTextInput = z.infer<typeof HumanizeTextInputSchema>;

export const HumanizeTextOutputSchema = z.object({
  humanizedText: z.string().describe('The rewritten text in a more human-sounding style.'),
  remaining: z.number().describe('The number of requests remaining in the current window.'),
  limit: z.number().describe('The total number of requests allowed in the window.'),
});
export type HumanizeTextOutput = z.infer<typeof HumanizeTextOutputSchema>;
