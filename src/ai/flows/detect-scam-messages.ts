'use server';

/**
 * @fileOverview A scam message detection AI agent.
 *
 * - detectScamMessage - A function that handles the scam message detection process.
 * - DetectScamMessageInput - The input type for the detectScamMessage function.
 * - DetectScamMessageOutput - The return type for the detectScamMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectScamMessageInputSchema = z.object({
  message: z.string().describe('The message to check for scam content.'),
});
export type DetectScamMessageInput = z.infer<typeof DetectScamMessageInputSchema>;

const DetectScamMessageOutputSchema = z.object({
  isScam: z.boolean().describe('Whether the message is a scam or not.'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('The confidence level of the scam detection (0 to 1).'),
  reason: z.string().describe('The reason for the scam detection.'),
});
export type DetectScamMessageOutput = z.infer<typeof DetectScamMessageOutputSchema>;

export async function detectScamMessage(input: DetectScamMessageInput): Promise<DetectScamMessageOutput> {
  return detectScamMessageFlow(input);
}

const detectScamMessagePrompt = ai.definePrompt({
  name: 'detectScamMessagePrompt',
  input: {schema: DetectScamMessageInputSchema},
  output: {schema: DetectScamMessageOutputSchema},
  prompt: `You are an AI expert in detecting scam messages.

You will receive a message and must determine if it is a scam or not.

Return isScam as true if the message is a scam, and false if it is not.
Also, provide a confidence level between 0 and 1, and a reason for your determination.

Message: {{{message}}}`,
});

const detectScamMessageFlow = ai.defineFlow(
  {
    name: 'detectScamMessageFlow',
    inputSchema: DetectScamMessageInputSchema,
    outputSchema: DetectScamMessageOutputSchema,
  },
  async input => {
    const {output} = await detectScamMessagePrompt(input);
    return output!;
  }
);
