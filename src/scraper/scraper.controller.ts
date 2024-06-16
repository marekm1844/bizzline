// news.controller.ts
import { Controller, Get, Logger, Query } from '@nestjs/common';
import { GoogleNewsService } from './google-news.service';
import { NewsScraperService } from './news-scraper.service';
import { News } from './news.type';
import { NewsRepository } from './news.repository';
import { BubbleService } from './bubble.service';
import { DocumentService } from 'src/ai/document.service';
import { Document } from 'langchain/dist/document';
import { get } from 'http';

@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: GoogleNewsService,
    private readonly newsScraperService: NewsScraperService,
    //private readonly newsRepository: NewsRepository,
    private readonly bubbleService: BubbleService,
    private readonly documentService: DocumentService,
  ) {}

  @Get('generate')
  async generateDocument(@Query('url') url: string) {
    const document = await this.documentService.fetchArticleContent(url);
    //return document;
  }

  @Get('scrape')
  async scrape(
    @Query('url') url: string,
    @Query('company') companyName: string,
    @Query('scraper') scraperName: string | null,
  ): Promise<News[]> {
    return await this.newsScraperService.scrapeArticle(
      url,
      companyName,
      scraperName,
    );
  }

  @Get('latest')
  async getLatestNewsDate(@Query('company') companyName: string) {
    return await this.bubbleService.getLatestPostForCompany(companyName);
  }

  @Get('bubble')
  async getBubbleData(@Query('id') id: string) {
    return await this.bubbleService.getApiPost(id);
  }

  @Get('scrapeAll')
  async scrapeAll() {
    return await this.newsScraperService.handleCron();
  }
}
