import * as z from 'zod';

const Tags = z.enum(
  ['Team', 'Funding', 'Partnerships', 'Product', 'Milestones', 'Acquisition'],
  { description: 'Tags' },
);

export const ArticleSchema = z.object({
  article: z
    .string()
    .describe(
      'the article with BBCode formatting as in the examplei.  Make new line after each paragraph by using [tr][td] [/td][/tr] [tr][td] [/td][/tr] BBCode tags.',
    ),
  title: z
    .string()
    .max(200)
    .describe('The title of the article not exceeding 200 characters'),
  summary: z
    .string()
    .describe('A summary of the article not exceeding 300 characters'),
  tag: Tags.describe(
    'Assign tag based on the context of the article from categories such as Team, Funding, etc.',
  ),
});

// This type can be used elsewhere in your code
export type Article = z.infer<typeof ArticleSchema>;
