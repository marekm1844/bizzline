// news.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { GoogleNewsService } from './google-news.service';
import { NewsScraperService } from './news-scraper.service';
import { News } from './news.type';

@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: GoogleNewsService,
    private readonly newsScraperService: NewsScraperService,
  ) {}

  @Get()
  async getCompanyNews(@Query('company') companyName: string) {
    return await this.newsService.scrapeCompanyNews(companyName);
  }

  @Get('scrape')
  async scrape(@Query('url') url: string): Promise<News[]> {
    return await this.newsScraperService.scrapeArticle(url);
  }

  @Get('latest')
  async getLatestNewsDate(@Query('company') companyName: string) {
    return await this.newsScraperService.getLatestNewsDate(companyName);
  }
}
