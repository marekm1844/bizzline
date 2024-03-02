import { Inject, Logger } from '@nestjs/common';
import { IScraper } from '../scrapers/scraper.interface';
import { NewsTag, NewsWithSummary } from './news.type';
import { GptSummaryService } from '../ai/llm.service';
import { NewsRepository } from './news.repository';
import { ScraperFactory } from './scraper.factory';
import { BubbleService } from './bubble.service';

export class NewsScraperService {
  private readonly logger = new Logger(NewsScraperService.name);
  private scraper: IScraper;

  constructor(
    @Inject(GptSummaryService)
    private readonly summaryService: GptSummaryService,
    private readonly repo: NewsRepository,
    private readonly scraperFactory: ScraperFactory,
    private readonly bubbleService: BubbleService,
  ) {}
  async scrapeArticle(url: string): Promise<NewsWithSummary[]> {
    this.scraper = this.scraperFactory.getScraper(url);

    this.logger.log(`Scraping article from ${url}`);
    const result = await this.scraper.scrapeArticle(url);
    const processedArticles: NewsWithSummary[] = [];

    for (const article of result) {
      const summary = await this.summaryService.generateJsonSummary(
        article.innerText,
      );
      const withSummary: NewsWithSummary = {
        company: article.company,
        date: article.date,
        link: article.link,
        source: article.source,
        title: article.title,
        summary: summary.summary,
        article: summary.article,
        imageUrl: article.imageUrl,
        tag: summary.tag as NewsTag,
      };

      await this.bubbleService.createPost(withSummary);
      //await this.repo.create(withSummary);
      processedArticles.push(withSummary);
    }

    return processedArticles;
  }

  async getLatestNewsDate(companyName: string): Promise<Date | null> {
    return await this.repo.getLatestNewsDate(companyName);
  }
}
