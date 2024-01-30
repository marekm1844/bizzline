import { ArticleContentService } from '../scraper/article-content.service';
import { NewsWithArticle } from '../scraper/news.type';
import { IScraper } from './scraper.interface';
import * as cheerio from 'cheerio';
import { parse } from 'date-fns';

export class OpemAiWebScraperService implements IScraper {
  private articleContentService: ArticleContentService;

  constructor() {
    this.articleContentService = new ArticleContentService();
  }
  canHandle(url: string): boolean {
    return /^https?:\/\/.*openai.com.*\//i.test(url);
  }
  async scrapeArticle(url): Promise<NewsWithArticle[]> {
    if (!/^https?:\/\/.*openai.com.*\//i.test(url)) {
      throw new Error('Invalid URL. Only ScalabilityAi URLs are allowed.');
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
      const link =
        'https://yourwebsite.com' + $(element).find('a').attr('href');
      const date = $(element).find('.f-body-1 span').first().text().trim();
      const source = 'Open AI Website';
      const company = 'openai.com';

      newsItems.push({ title, link, date, source, company });
    });

    const withArticles: NewsWithArticle[] = await Promise.all(
      newsItems.map(async (item) => {
        const articleHtml =
          await this.articleContentService.fetchArticleContent(item.link);
        return {
          ...item,
          date: parse(item.date.slice(0, 10), 'dd/MM/yyyy', new Date()),
          innerText: articleHtml,
        };
      }),
    );

    return withArticles;
  }
}
