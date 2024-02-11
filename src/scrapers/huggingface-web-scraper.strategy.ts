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
    //https://huggingface.co/blog
    return /^https?:\/\/.*huggingface.*\//i.test(url);
  }
  async scrapeArticle(url): Promise<NewsWithArticle[]> {
    if (!this.canHandle(url)) {
      throw new Error('Invalid URL. Only huggingface URLs are allowed.');
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
          const imageUrl = 'https://huggingface.co' + props.blog.thumbnail;
          Logger.debug(
            `[${this.constructor.name}] scrapeArticle: ${title} ${link} ${date} ${source} ${company} ${imageUrl} `,
          );
          newsItems.push({ title, link, date, source, company, imageUrl });
        }
      }
    });

    const withArticles: NewsWithArticle[] = await Promise.all(
      newsItems.map(async (item) => {
        // Determine the format based on the length of the month string
        const monthIsShort = item.date.split(' ')[0].length <= 3;
        const formatString = monthIsShort ? 'MMM d, yyyy' : 'MMMM d, yyyy';

        // Parse the date
        let parsedDate;
        try {
          parsedDate = parse(item.date.trim(), formatString, new Date());
          if (parsedDate.toString() === 'Invalid Date') {
            const [month, day, year] = item.date.split(' ');
            const correctedDate = `${month.substring(0, 3)} ${day} ${year}`;
            parsedDate = parse(correctedDate, 'MMM d, yyyy', new Date());
          }
        } catch (err) {
          Logger.error(`Error parsing date: ${item.date}`);
        }

        const articleHtml =
          await this.articleContentService.fetchArticleContent(item.link);

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
