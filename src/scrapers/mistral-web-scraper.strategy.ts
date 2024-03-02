import { Logger } from '@nestjs/common';
import { ArticleContentService } from '../scraper/article-content.service';
import { NewsWithArticle } from '../scraper/news.type';
import { IScraper } from './scraper.interface';
import * as cheerio from 'cheerio';
import { parse } from 'date-fns';

export class MistralWebScraperService implements IScraper {
  private articleContentService: ArticleContentService;

  constructor() {
    this.articleContentService = new ArticleContentService();
  }
  canHandle(url: string): boolean {
    //https://mistral.ai/news/
    return /^https?:\/\/.*mistral.ai.*\//i.test(url);
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

    $('article.border.news-card').each((_, element) => {
      const title = $(element).find('h4 a').text().trim();
      const link =
        'https://mistral.ai/news' + $(element).find('h4 a').attr('href'); // Adjust base URL as necessary
      const date = $(element).find('li.list-inline-item.pr-4').text().trim();
      const source = 'Mistral  Website';
      const company = 'mistral';
      const imageUrl = $(element).find('img.card-img-top').attr('src');
      /**
        const fullImageUrl = imageUrl.startsWith('http')
          ? imageUrl
          : `https://mistral.ai${imageUrl}`;
      */
      const fullImageUrl = '';
      Logger.debug(
        `[${this.constructor.name}] scrapeArticle: ${title} ${link} Date: ${date} ${source} ${company} ${fullImageUrl} `,
      );
      newsItems.push({
        title,
        link,
        date,
        source,
        company,
        imageUrl: fullImageUrl,
      });
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
