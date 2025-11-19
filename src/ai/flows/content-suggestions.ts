// src/ai/flows/content-suggestions.ts
'use server';
/**
 * @fileOverview A content suggestion AI agent.
 *
 * - getContentSuggestions - A function that suggests content based on existing copy.
 * - ContentSuggestionsInput - The input type for the getContentSuggestions function.
 * - ContentSuggestionsOutput - The return type for the getContentSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContentSuggestionsInputSchema = z.object({
  existingContent: z
    .string()
    .describe('The existing content in the editor.'),
  topic: z.string().optional().describe('Optional topic for the content.'),
});
export type ContentSuggestionsInput = z.infer<
  typeof ContentSuggestionsInputSchema
>;

const ContentSuggestionsOutputSchema = z.object({
  suggestions: z
    .string()
    .describe('AI-powered content suggestions based on the existing copy.'),
});
export type ContentSuggestionsOutput = z.infer<
  typeof ContentSuggestionsOutputSchema
>;

export async function getContentSuggestions(
  input: ContentSuggestionsInput
): Promise<ContentSuggestionsOutput> {
  return contentSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contentSuggestionsPrompt',
  input: {schema: ContentSuggestionsInputSchema},
  output: {schema: ContentSuggestionsOutputSchema},
  prompt: `You are an AI assistant designed to provide content suggestions.

  Based on the existing content provided, generate relevant and helpful suggestions to expand upon the current draft.  Incorporate the topic if provided.

  Existing Content: {{{existingContent}}}

  Topic: {{{topic}}}
  Suggestions:`,
});

const contentSuggestionsFlow = ai.defineFlow(
  {
    name: 'contentSuggestionsFlow',
    inputSchema: ContentSuggestionsInputSchema,
    outputSchema: ContentSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
