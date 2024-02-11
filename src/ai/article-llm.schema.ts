import * as z from 'zod';

const Tags = z.enum(
  [
    'Team',
    'Funding',
    'Partnership',
    'Product',
    'Legal',
    'Milestone',
    'Acquisition',
  ],
  { description: 'Tags' },
);

export const ArticleSchema = z.object({
  article: z
    .string()
    .describe('The full text of the article but with max of 15000 characters'),
  summary: z
    .string()
    .describe('A summary of the article not exceeding 300 characters'),
  tag: Tags.describe(
    'Assign tag based on the context of the article from categories such as Team, Funding, etc.',
  ),
});

// This type can be used elsewhere in your code
export type Article = z.infer<typeof ArticleSchema>;
