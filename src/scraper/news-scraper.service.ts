import { Inject, Logger } from '@nestjs/common';
import { IScraper } from '../scrapers/scraper.interface';
import { NewsWithSummary } from './news.type';
import { GptSummaryService } from '../ai/llm.service';
import { NewsRepository } from './news.repository';
import { ScraperFactory } from './scraper.factory';

export class NewsScraperService {
  private readonly logger = new Logger(NewsScraperService.name);
  private scraper: IScraper;

  constructor(
    @Inject(GptSummaryService)
    private readonly summaryService: GptSummaryService,
    private readonly repo: NewsRepository,
    private readonly scraperFactory: ScraperFactory,
  ) {}
  async scrapeArticle(url: string): Promise<NewsWithSummary[]> {
    this.scraper = this.scraperFactory.getScraper(url);

    this.logger.log(`Scraping article from ${url}`);
    const result = (await this.scraper.scrapeArticle(url)).slice(0, 8);
    return await Promise.all(
      result.map(async (article) => {
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
        };
        await this.repo.create(withSummary);
        return withSummary;
      }),
    );
  }

  async getLatestNewsDate(companyName: string): Promise<Date | null> {
    return await this.repo.getLatestNewsDate(companyName);
  }
}
