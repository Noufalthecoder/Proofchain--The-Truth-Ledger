'use server';
/**
 * @fileOverview This file defines a Genkit flow for cross-verifying fake news reports with trusted sources.
 *
 * The flow takes a news report as input and returns a verification result indicating whether the report is likely accurate.
 * It exports:
 * - crossVerifyFakeNews: The main function to trigger the flow.
 * - CrossVerifyFakeNewsInput: The input type for the flow.
 * - CrossVerifyFakeNewsOutput: The output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CrossVerifyFakeNewsInputSchema = z.object({
  newsReport: z.string().describe('The news report to cross-verify.'),
});
export type CrossVerifyFakeNewsInput = z.infer<typeof CrossVerifyFakeNewsInputSchema>;

const CrossVerifyFakeNewsOutputSchema = z.object({
  verificationResult: z.string().describe('The verification result indicating whether the news report is likely accurate.'),
});
export type CrossVerifyFakeNewsOutput = z.infer<typeof CrossVerifyFakeNewsOutputSchema>;

export async function crossVerifyFakeNews(input: CrossVerifyFakeNewsInput): Promise<CrossVerifyFakeNewsOutput> {
  return crossVerifyFakeNewsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'crossVerifyFakeNewsPrompt',
  input: {schema: CrossVerifyFakeNewsInputSchema},
  output: {schema: CrossVerifyFakeNewsOutputSchema},
  prompt: `You are an expert fact-checker. Given the following news report, cross-verify it with trusted sources and determine if it is likely accurate.\n\nNews Report: {{{newsReport}}}`,
});

const crossVerifyFakeNewsFlow = ai.defineFlow(
  {
    name: 'crossVerifyFakeNewsFlow',
    inputSchema: CrossVerifyFakeNewsInputSchema,
    outputSchema: CrossVerifyFakeNewsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
