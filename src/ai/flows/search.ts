'use server';
/**
 * @fileOverview A site search AI agent.
 *
 * - search - A function that searches site content based on a query.
 * - SearchInput - The input type for the search function.
 * - SearchOutput - The return type for the search function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DocumentSchema = z.object({
  type: z.enum(['Page', 'Post']),
  title: z.string(),
  url: z.string(),
});

const SearchInputSchema = z.object({
  query: z.string().describe('The user\'s search query.'),
  documents: z.array(DocumentSchema).describe('The list of documents to search through.'),
});
export type SearchInput = z.infer<typeof SearchInputSchema>;

const SearchOutputSchema = z.object({
  results: z.array(DocumentSchema).describe('The search results, ranked by relevance.'),
});
export type SearchOutput = z.infer<typeof SearchOutputSchema>;

export async function search(input: SearchInput): Promise<SearchOutput> {
    return searchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'searchPrompt',
  input: {schema: SearchInputSchema},
  output: {schema: SearchOutputSchema},
  prompt: `You are a helpful search assistant for a website. Your task is to find the most relevant documents based on the user's query.

Analyze the user's query and the provided list of documents. Return a ranked list of the documents that best match the user's intent. The results should be ordered from most to least relevant.

User Query: {{{query}}}

Available Documents:
{{#each documents}}
- Type: {{type}}, Title: "{{title}}", URL: {{url}}
{{/each}}
`,
});

const searchFlow = ai.defineFlow(
  {
    name: 'searchFlow',
    inputSchema: SearchInputSchema,
    outputSchema: SearchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
