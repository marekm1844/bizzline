import { Inject, Logger } from '@nestjs/common';
import { ArticleContentService } from '../scraper/article-content.service';
import { NewsWithArticle } from '../scraper/news.type';
import { IScraper } from './scraper.interface';
import * as cheerio from 'cheerio';
import { parse } from 'date-fns';
import { DocumentService } from '../ai/document.service';

export class GenericAiWebScraperService implements IScraper {
  private articleContentService: ArticleContentService;

  constructor(
    @Inject(DocumentService) private readonly documentService: DocumentService,
  ) {
    this.articleContentService = new ArticleContentService();
  }

  getName(): string {
    return 'GenericAiWebScraperService';
  }

  canHandle(url: string): boolean {
    //https://txt.cohere.com/tag/newsroom/
    return true;
  }
  async scrapeArticle(url): Promise<NewsWithArticle[]> {
    const response = await this.documentService.fetchArticleContent(url);
    if (!response) {
      throw new Error(`Error fetching article: ${JSON.stringify(response)}`);
    }

    response.articles.forEach((element) => {
      Logger.debug(
        `[${this.constructor.name}] scrapeArticle: ${element.title} ${element.link} Date: ${element.date} ${element.source}  ${element.imageUrl} `,
      );
    });

    const withArticles: NewsWithArticle[] = await Promise.all(
      response.articles.map(async (item) => {
        const articleHtml =
          await this.articleContentService.fetchArticleContent(item.link);
        const parsedDate = parse(item.date, 'YYYY-MM-DD HH:MM', new Date());
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
}
