import { Logger } from '@nestjs/common';
import { ArticleContentService } from '../scraper/article-content.service';
import { NewsWithArticle } from '../scraper/news.type';
import { IScraper } from './scraper.interface';
import * as cheerio from 'cheerio';
import { parse } from 'date-fns';

export class CohereWebScraperService implements IScraper {
  private articleContentService: ArticleContentService;

  constructor() {
    this.articleContentService = new ArticleContentService();
  }

  getName(): string {
    return this.constructor.name;
  }
  canHandle(url: string): boolean {
    //https://txt.cohere.com/tag/newsroom/
    return /^https?:\/\/.*cohere.*\//i.test(url);
  }
  async scrapeArticle(url): Promise<NewsWithArticle[]> {
    if (!this.canHandle(url)) {
      throw new Error('Invalid URL. Only cohare URLs are allowed.');
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error fetching article: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const newsItems = [];

    $('article.post-card').each((_, element) => {
      const title = $(element).find('header.post-card-header h2').text().trim();
      const link =
        'https://txt.cohere.com' +
        $(element).find('a.post-card-content-link').attr('href');
      const date = $(element).find('.overline-text time').attr('datetime');
      const source = 'Cohere Website';
      const company = 'cohere';
      let imageUrl = $(element).find('.post-card-image').attr('src') || '';
      if (!imageUrl.startsWith('http')) {
        imageUrl = `https://txt.cohere.com${imageUrl}`;
      }

      Logger.debug(
        `[${this.constructor.name}] scrapeArticle: ${title} ${link} Date: ${date} ${source} ${company} ${imageUrl} `,
      );
      newsItems.push({ title, link, date, source, company, imageUrl });
    });

    const withArticles: NewsWithArticle[] = await Promise.all(
      newsItems.map(async (item) => {
        const articleHtml =
          await this.articleContentService.fetchArticleContent(item.link);
        const parsedDate = parse(item.date, 'LLL dd, yyyy', new Date());
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
