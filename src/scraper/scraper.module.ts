import { Module } from '@nestjs/common';
import { GoogleNewsService } from './google-news.service';
import { NewsController } from './scraper.controller';
import { ArticleContentService } from './article-content.service';
import { AiModule } from 'src/ai/ai.module';
import { MongooseModule } from '@nestjs/mongoose';
import { NewsSchema } from './news.type';
import { NewsScraperService } from './news-scraper.service';
import { NewsRepository } from './news.repository';
import { ScrapersModule } from '../scrapers/scrapers.module';
import { ScraperFactory } from './scraper.factory';
import { BubbleService } from './bubble.service';
import { HttpModule } from '@nestjs/axios';
import { ImageService } from './image.service';

@Module({
  imports: [
    AiModule,
    ScrapersModule,
    MongooseModule.forFeature([{ name: 'News', schema: NewsSchema }]),
    HttpModule,
  ],
  providers: [
    GoogleNewsService,
    NewsScraperService,
    ArticleContentService,
    NewsRepository,
    ScraperFactory,
    BubbleService,
    ImageService,
  ],
  controllers: [NewsController],
})
export class ScraperModule {}
