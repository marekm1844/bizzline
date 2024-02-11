import * as z from 'zod';

export const ArticleSchema = z.object({
  article: z
    .string()
    .describe('The full text of the article but with max of 15000 characters'),
  summary: z
    .string()
    .describe('A summaty of the article not exceeding 300 characters'),
});

// This type can be used elsewhere in your code
export type Article = z.infer<typeof ArticleSchema>;
