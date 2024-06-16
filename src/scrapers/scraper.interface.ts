import { NewsWithArticle } from '../scraper/news.type';

export interface IScraper {
  scrapeArticle(url: string): Promise<NewsWithArticle[]>;
  canHandle(url: string): boolean;
  getName(): string;
}
