import { Logger } from '@nestjs/common';
import { ArticleContentService } from '../scraper/article-content.service';
import { NewsWithArticle } from '../scraper/news.type';
import { IScraper } from './scraper.interface';
import * as cheerio from 'cheerio';

export class AI21WebScraperService implements IScraper {
  private articleContentService: ArticleContentService;

  constructor() {
    this.articleContentService = new ArticleContentService();
  }
  getName(): string {
    return this.constructor.name;
  }
  canHandle(url: string): boolean {
    //https://www.ai21.com/blog
    return /^https?:\/\/.*ai21.com.*\//i.test(url);
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

    $('.w-dyn-item').each((index, element) => {
      let title = $(element).find('.blog-title').text().trim();
      if (!title) {
        // If title is empty, try alternative selector
        title = $(element).find('.blog-spotlight-title').text().trim();
      }
      const link =
        'https://www.ai21.com' + $(element).find('a.blog-content').attr('href');
      const date = $(element).find('.blog-date').text().trim();
      const source = 'AI21 Website';
      const company = 'ai21';
      const imageUrl = $(element).find('.image-cover').attr('src') || ''; // Adjust the selector as needed

      Logger.debug(
        `[${this.constructor.name}] scrapeArticle: ${title} ${link} ${date} ${source} ${company} ${imageUrl} `,
      );
      newsItems.push({ title, link, date, source, company, imageUrl });
    });

    const withArticles: NewsWithArticle[] = await Promise.all(
      newsItems.map(async (item) => {
        const articleHtml =
          await this.articleContentService.fetchArticleContent(item.link);
        //const parsedDate = parse(item.date, 'MMM dd, yyyy', new Date());
        return {
          ...item,
          date: new Date(),
          innerText: articleHtml,
        };
      }),
    );

    return withArticles;
  }
}
