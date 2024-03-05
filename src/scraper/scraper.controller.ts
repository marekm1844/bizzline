// news.controller.ts
import { Controller, Get, Logger, Query } from '@nestjs/common';
import { GoogleNewsService } from './google-news.service';
import { NewsScraperService } from './news-scraper.service';
import { News } from './news.type';
import { NewsRepository } from './news.repository';
import { BubbleService } from './bubble.service';

@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: GoogleNewsService,
    private readonly newsScraperService: NewsScraperService,
    private readonly newsRepository: NewsRepository,
    private readonly bubbleService: BubbleService,
  ) {}

  @Get('google-scrape')
  async getCompanyNews(@Query('company') companyName: string) {
    return await this.newsService.scrapeCompanyNews(companyName);
  }

  @Get('scrape')
  async scrape(@Query('url') url: string): Promise<News[]> {
    return await this.newsScraperService.scrapeArticle(url);
  }

  @Get('latest')
  async getLatestNewsDate(@Query('company') companyName: string) {
    return await this.bubbleService.getLatestPostForCompany(companyName);
  }

  @Get()
  async getNews(
    @Query('company') company: string,
    @Query('page') page: number,
    @Query('size') size: number,
  ) {
    const result = await this.newsRepository.getNewsByCompany(
      company,
      page,
      size,
    );

    Logger.debug(`getNews: ${JSON.stringify(result)}`);

    this.bubbleService.createPost(result[0]);
  }

  @Get('bubble')
  async getBubbleData(@Query('id') id: string) {
    return await this.bubbleService.getApiPost(id);
  }
}
