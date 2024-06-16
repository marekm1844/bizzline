import { Logger } from '@nestjs/common';
import { ArticleContentService } from '../scraper/article-content.service';
import { NewsWithArticle } from '../scraper/news.type';
import { IScraper } from './scraper.interface';
import * as cheerio from 'cheerio';
import { parse } from 'date-fns';

export class OpenAiWebScraperService implements IScraper {
  private articleContentService: ArticleContentService;

  constructor() {
    this.articleContentService = new ArticleContentService();
  }

  getName(): string {
    return this.constructor.name;
  }
  canHandle(url: string): boolean {
    //https://openai.com/blog?topics=announcements
    return /^https?:\/\/.*openai.com.*\//i.test(url);
  }
  async scrapeArticle(url): Promise<NewsWithArticle[]> {
    if (!/^https?:\/\/.*openai.com.*\//i.test(url)) {
      throw new Error('Invalid URL. Only openai URLs are allowed.');
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error fetching article: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const newsItems = [];

    $('.ui-list .cols-container li').each((index, element) => {
      const title = $(element).find('h3').text().trim();
      const link = 'https://openai.com' + $(element).find('a').attr('href');
      const date = $(element).find('.f-body-1 span').first().text().trim();
      const source = 'Open AI Website';
      const company = 'openai';
      let imageUrl = $(element).find('img').attr('src');
      imageUrl = imageUrl.split('?')[0];
      Logger.debug(
        `[OpenAiWebScraperService] scrapeArticle: ${title} ${link} ${date} ${source} ${company} ${imageUrl} `,
      );
      newsItems.push({ title, link, date, source, company, imageUrl });
    });

    const withArticles: NewsWithArticle[] = await Promise.all(
      newsItems.map(async (item) => {
        const articleHtml =
          await this.articleContentService.fetchArticleContent(item.link);
        const parsedDate = parse(item.date, 'MMMM dd, yyyy', new Date());
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
