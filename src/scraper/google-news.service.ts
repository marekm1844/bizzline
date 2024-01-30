// news.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { ArticleContentService } from './article-content.service';

@Injectable()
export class GoogleNewsService {
  constructor(private readonly articleContentService: ArticleContentService) {}
  async scrapeCompanyNews(companyName: string): Promise<any[]> {
    try {
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(
        companyName,
      )}&hl=en-US&gl=US&ceid=US:en`;
      const response = await axios.get(url);
      const result = await parseStringPromise(response.data);

      // Limiting the articles to the first 20
      const limitedItems = result.rss.channel[0].item.slice(0, 20);

      const newsItems = await Promise.all(
        limitedItems.map(async (item) => {
          const articleHtml =
            await this.articleContentService.fetchArticleContent(item.link[0]);
          return {
            title: item.title[0],
            link: item.link[0],
            publicationDate: item.pubDate[0],
            description: item.description[0],
            articleHtml: articleHtml,
          };
        }),
      );

      return newsItems;
    } catch (error) {
      console.error('Error scraping company news:', error);
      throw error;
    }
  }
}
