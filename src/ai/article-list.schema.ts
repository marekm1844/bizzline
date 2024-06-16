import * as z from 'zod';

export const ArticleListSchema = z.object({
  articles: z
    .array(
      z.object({
        link: z.string().min(1).url().describe('The URL of the article'),
        title: z.string().describe('The title of the article'),
        date: z
          .string()
          .describe(
            'The date of the article in the format YYYY-MM-DD If no date is available, it should be an empty string.',
          ),
        imageUrl: z
          .string()
          .describe(
            'The URL to the image of the article. If there is no image, it should be an empty string.',
          ),
        source: z
          .string()
          .describe('It always name of the company plus "Wbsite AI Scraper"'),
      }),
    )
    .min(1),
});
