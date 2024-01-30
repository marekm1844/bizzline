import { Logger } from '@nestjs/common';
import { ArticleContentService } from '../scraper/article-content.service';
import { NewsWithArticle } from '../scraper/news.type';
import { IScraper } from './scraper.interface';
import * as cheerio from 'cheerio';
import { parse } from 'date-fns';

export class HuggingFaceWebScraperService implements IScraper {
  private articleContentService: ArticleContentService;

  constructor() {
    this.articleContentService = new ArticleContentService();
  }
  canHandle(url: string): boolean {
    return /^https?:\/\/.*huggingface.*\//i.test(url);
  }
  async scrapeArticle(url): Promise<NewsWithArticle[]> {
    if (!this.canHandle(url)) {
      throw new Error('Invalid URL. Only ScalabilityAi URLs are allowed.');
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error fetching article: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const newsItems = [];

    $('.SVELTE_HYDRATER.contents').each((_, element) => {
      const dataProps = $(element).attr('data-props');
      if (dataProps) {
        const props = JSON.parse(dataProps.replace(/&quot;/g, '"'));
        if (props.blog) {
          const title = props.blog.title;
          const date = props.blog.date;
          const link = 'https://huggingface.co/blog' + props.blog.local;
          const source = 'HuggingFace Website';
          const company = 'huggingface';
          Logger.debug(
            `[${this.constructor.name}] scrapeArticle: ${title} ${link} ${date} ${source} ${company} `,
          );
          newsItems.push({ title, link, date, source, company });
        }
      }
    });

    const withArticles: NewsWithArticle[] = await Promise.all(
      newsItems.map(async (item) => {
        const articleHtml =
          await this.articleContentService.fetchArticleContent(item.link);
        // Determine the format based on the length of the month string
        const monthIsShort = item.date.split(' ')[0].length <= 3;
        const formatString = monthIsShort ? 'MMM d, yyyy' : 'MMMM d, yyyy';

        // Parse the date
        const parsedDate = parse(item.date, formatString, new Date());
        return {
          ...item,
          date: parsedDate,
          innerText: articleHtml,
        };
      }),
    );

    return withArticles;
  }
}
