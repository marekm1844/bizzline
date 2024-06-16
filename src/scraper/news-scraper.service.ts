import { Inject, Logger } from '@nestjs/common';
import { IScraper } from '../scrapers/scraper.interface';
import { NewsTag, NewsWithArticle, NewsWithSummary } from './news.type';
import { GptSummaryService } from '../ai/llm.service';
import { ScraperFactory } from './scraper.factory';
import { BubbleService } from './bubble.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { format, parse } from 'date-fns';
import { DocumentService } from '../ai/document.service';
import { ArticleContentService } from './article-content.service';
import { ScrapingUrlInfo } from './scraping-info.interface';
import { ImageAssetService } from 'src/assets/image-asset.service';

export class NewsScraperService {
  private readonly logger = new Logger(NewsScraperService.name);
  private scraper: IScraper;

  constructor(
    @Inject(GptSummaryService)
    private readonly summaryService: GptSummaryService,
    @Inject(DocumentService)
    private readonly documentService: DocumentService,
    //  private readonly repo: NewsRepository,
    private readonly scraperFactory: ScraperFactory,
    private readonly bubbleService: BubbleService,
    private readonly configService: ConfigService,
    private readonly articleContentService: ArticleContentService,
    private readonly imageService: ImageAssetService,
  ) {}

  /**
   * Scrapes an article from the given URL and returns an array of processed articles with summaries.
   * @param url - The URL of the article to scrape.
   * @returns A promise that resolves to an array of processed articles with summaries.
   */
  async scrapeArticle(
    url: string,
    slug: string,
    scraperName?: string,
  ): Promise<NewsWithSummary[]> {
    this.logger.log(`Scraping article from ${url}`);
    const latestNews = await this.bubbleService.getLatestPostForCompany(slug);

    let result: NewsWithArticle[];
    if (
      [
        'inflectionai',
        'cohere',
        'anthropic',
        'openai',
        'synthesia',
        'ai21',
        'arrival',
        'colossyan',
      ].includes(slug)
    ) {
      this.scraper = this.scraperFactory.getScraper(url, scraperName);
      result = await this.scraper.scrapeArticle(url);
    } else {
      result = await this.scrapeArticleScraper(url);
    }

    //result.sort((a, b) => a.date.getTime() - b.date.getTime());
    const processedArticles: NewsWithSummary[] = [];

    for (const article of result) {
      if (latestNews && article.date <= latestNews.date) {
        Logger.debug(
          `[${this.constructor.name}] scrapeArticle: Skipping article ${article.title} from ${article.company} with date ${article.date} as it is older than the latest news date: ${latestNews.date}`,
        );
        continue;
      }

      if (
        latestNews &&
        !latestNews.hasDate &&
        article.link === latestNews.link
      ) {
        Logger.debug(
          `[${this.constructor.name}] scrapeArticle: Link Skippg ${article.title} from ${article.company} with date ${article.date} as it has no date and is the same as the latest news`,
        );
        return processedArticles;
      }

      const summary = await this.summaryService.generateJsonSummary(
        article.innerText,
      );
      const withSummary: NewsWithSummary = {
        company: slug,
        date: article.date
          ? article.date
          : parse(summary.date, 'yyyy-MM-dd', new Date()),
        link: article.link,
        source: article.source,
        title: article.title,
        summary: summary.summary,
        article: '[table]' + summary.article + '[/table]',
        imageUrl: article.imageUrl,
        tag: summary.tag as NewsTag,
        hasDate: true,
      };

      if (latestNews && withSummary.date <= latestNews.date) {
        Logger.debug(
          `[${this.constructor.name}] withSummary: Skipping article ${withSummary.title} from ${withSummary.company} with date ${withSummary.date} as it is older than the latest news date`,
        );
        return processedArticles;
      }

      Logger.debug(
        `[${this.constructor.name}] scrapeArticle: ${withSummary.title} ${withSummary.link} ${withSummary.date} ${withSummary.source} ${withSummary.company} ${withSummary.imageUrl} `,
      );

      if (withSummary.imageUrl && withSummary.imageUrl.length > 0) {
        const fileName =
          format(withSummary.date, 'yyyyMMdd') +
          '-' +
          withSummary.title
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-');
        const fileExtension = withSummary.imageUrl.split('.').pop();
        const fullFileName = fileName + '.' + fileExtension;

        const { imageAsset, error } =
          await this.imageService.uploadImageFromUrl(
            withSummary.imageUrl,
            fullFileName,
          );

        Logger.debug(
          `[${this.constructor.name}] Image uploaded: ${imageAsset.url}  error ${error}`,
        );
        if (imageAsset) {
          withSummary.coverImageUrl = imageAsset.url;
        }
      }

      await this.bubbleService.createPost(withSummary);
      //await this.repo.create(withSummary);
      processedArticles.push(withSummary);
    }

    Logger.log(
      `[${this.constructor.name}] scraped articles: ${processedArticles.length}`,
    );
    return processedArticles;
  }

  /**
   * Scheduled task that scrapes articles from a predefined list of URLs every hour.
   */
  @Cron(CronExpression.EVERY_DAY_AT_4PM)
  async handleCron() {
    const urls = this.getScrapingUrls(); // Method to retrieve the list of URLs to scrape
    this.logger.log(`Starting scheduled scraping task for ${urls.length} URLs`);
    console.log(urls);

    for (const url of urls) {
      try {
        await this.scrapeArticle(url.url, url.companyName, url.scraperName);
        this.logger.log(`Completed scraping for URL: ${url}`);
      } catch (error) {
        this.logger.error(`Error scraping URL ${url}: ${error.message}`);
      }
    }
  }

  private getScrapingUrls(): ScrapingUrlInfo[] {
    const urlsWithCompany = this.configService.get<string>(
      'SCRAPE_URLS_WITH_COMPANY',
    );
    if (!urlsWithCompany) {
      return [];
    }

    // Split the urls and companyNames by comma
    const urlCompanyPairs = urlsWithCompany
      .split(',')
      .map((pair) => pair.trim());

    // Construct an array of objects with url and companyName properties
    const scrapingUrls: ScrapingUrlInfo[] = urlCompanyPairs.map((pair) => {
      const [url, companyName, scraperName] = pair
        .split('|')
        .map((item) => item.trim());
      return { url, companyName, scraperName };
    });

    return scrapingUrls;
  }

  private async scrapeArticleScraper(url): Promise<NewsWithArticle[]> {
    const response = await this.documentService.fetchArticleContent(url);
    ('');
    if (!response) {
      throw new Error(`Error fetching article: ${JSON.stringify(response)}`);
    }

    /**
      response.articles.forEach((element) => {
        Logger.debug(
          `[${this.constructor.name}] scrapeArticle: ${element.title} ${element.link} Date: ${element.date} ${element.source}  ${element.imageUrl} `,
        );
      });
    */

    const withArticles: NewsWithArticle[] = await Promise.all(
      response.articles.map(async (item) => {
        const articleHtml =
          await this.articleContentService.fetchArticleContent(item.link);

        let parsedDate;
        if (item.date != 'YYYY-MM-DD') {
          parsedDate = parse(item.date, 'yyyy-MM-dd', new Date());
        } else {
          parsedDate = undefined;
        }
        return {
          title: item.title,
          link: item.link,
          date: parsedDate,
          innerText: articleHtml,
          company: 'genericai',
          source: item.source,
          imageUrl: item.imageUrl,
        };
      }),
    );

    return withArticles;
  }

  /**
    async getLatestNewsDate(companyName: string): Promise<Date | null> {
      return await this.repo.getLatestNewsDate(companyName);
    }
  */
}
