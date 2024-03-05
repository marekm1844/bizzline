import { Inject, Logger } from '@nestjs/common';
import { IScraper } from '../scrapers/scraper.interface';
import { NewsTag, NewsWithSummary } from './news.type';
import { GptSummaryService } from '../ai/llm.service';
import { NewsRepository } from './news.repository';
import { ScraperFactory } from './scraper.factory';
import { BubbleService } from './bubble.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';

export class NewsScraperService {
  private readonly logger = new Logger(NewsScraperService.name);
  private scraper: IScraper;

  constructor(
    @Inject(GptSummaryService)
    private readonly summaryService: GptSummaryService,
    private readonly repo: NewsRepository,
    private readonly scraperFactory: ScraperFactory,
    private readonly bubbleService: BubbleService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Scrapes an article from the given URL and returns an array of processed articles with summaries.
   * @param url - The URL of the article to scrape.
   * @returns A promise that resolves to an array of processed articles with summaries.
   */
  async scrapeArticle(url: string): Promise<NewsWithSummary[]> {
    this.scraper = this.scraperFactory.getScraper(url);

    this.logger.log(`Scraping article from ${url}`);
    const result = await this.scraper.scrapeArticle(url);
    const processedArticles: NewsWithSummary[] = [];

    for (const article of result) {
      const latestNews = await this.bubbleService.getLatestPostForCompany(
        article.company,
      );
      if (latestNews && article.date <= latestNews.date) {
        Logger.debug(
          `[${this.constructor.name}] scrapeArticle: Skipping article ${article.title} from ${article.company} with date ${article.date} as it is older than the latest news date`,
        );
        continue;
      }

      const summary = await this.summaryService.generateJsonSummary(
        article.innerText,
      );
      const withSummary: NewsWithSummary = {
        company: article.company,
        date: article.date,
        link: article.link,
        source: article.source,
        title: summary.title,
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

  /**
   * Scheduled task that scrapes articles from a predefined list of URLs every hour.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    const urls = this.getScrapingUrls(); // Method to retrieve the list of URLs to scrape
    this.logger.log(`Starting scheduled scraping task for ${urls.length} URLs`);

    for (const url of urls) {
      try {
        await this.scrapeArticle(url);
        this.logger.log(`Completed scraping for URL: ${url}`);
      } catch (error) {
        this.logger.error(`Error scraping URL ${url}: ${error.message}`);
      }
    }
  }

  private getScrapingUrls(): string[] {
    return this.configService.get<string[]>('scrapeUrls');
  }

  async getLatestNewsDate(companyName: string): Promise<Date | null> {
    return await this.repo.getLatestNewsDate(companyName);
  }
}
