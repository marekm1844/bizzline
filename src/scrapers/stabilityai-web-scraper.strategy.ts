import { ArticleContentService } from '../scraper/article-content.service';
import { NewsWithArticle } from '../scraper/news.type';
import { IScraper } from './scraper.interface';
import * as cheerio from 'cheerio';
import { parse } from 'date-fns';

export class StabilityAiWebScraperService implements IScraper {
  private articleContentService: ArticleContentService;

  constructor() {
    this.articleContentService = new ArticleContentService();
  }
  canHandle(url: string): boolean {
    return /^https?:\/\/.*stability.ai.*\//i.test(url);
  }
  async scrapeArticle(url): Promise<NewsWithArticle[]> {
    if (!/^https?:\/\/.*stability.ai.*\//i.test(url)) {
      throw new Error('Invalid URL. Only ScalabilityAi URLs are allowed.');
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error fetching article: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const newsItems = [];

    $('.blog-side-by-side-wrapper .blog-item').each((index, element) => {
      const title = $(element).find('.blog-title a').text().trim();
      const link =
        'https://stability.ai' + $(element).find('.blog-title a').attr('href');
      const date = $(element).find('.blog-date').text().trim();
      const source = 'Stability AI Website';
      const company = 'stability.ai';

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
