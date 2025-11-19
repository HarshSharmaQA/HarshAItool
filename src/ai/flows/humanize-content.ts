'use server';
/**
 * @fileOverview A content humanization AI agent.
 *
 * - humanizeContent - A function that rewrites content to sound more human.
 * - HumanizeContentInput - The input type for the humanizeContent function.
 * - HumanizeContentOutput - The return type for the humanizeContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HumanizeContentInputSchema = z.object({
  content: z.string().describe('The content to be humanized.'),
});
export type HumanizeContentInput = z.infer<typeof HumanizeContentInputSchema>;

const HumanizeContentOutputSchema = z.object({
  humanizedContent: z.string().describe('The rewritten, more human-like content.'),
});
export type HumanizeContentOutput = z.infer<
  typeof HumanizeContentOutputSchema
>;

export async function humanizeContent(
  input: HumanizeContentInput
): Promise<HumanizeContentOutput> {
  return humanizeContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'humanizeContentPrompt',
  input: {schema: HumanizeContentInputSchema},
  output: {schema: HumanizeContentOutputSchema},
  prompt: `You are an expert copy editor. Rewrite the following content to make it more engaging, readable, and human-like. Use a friendly but professional tone. Vary sentence length, mix short punchy lines with longer descriptive ones, and avoid generic AI phrases like "cutting-edge" or "revolutionary".

  Content to rewrite:
  {{{content}}}
  `,
});

const humanizeContentFlow = ai.defineFlow(
  {
    name: 'humanizeContentFlow',
    inputSchema: HumanizeContentInputSchema,
    outputSchema: HumanizeContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
