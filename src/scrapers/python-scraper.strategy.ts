import { Injectable, Logger } from '@nestjs/common';
import { IScraper } from './scraper.interface';
import { NewsWithArticle } from '../scraper/news.type';
import axios from 'axios';
import { parse } from 'date-fns';
import { ArticleContentService } from 'src/scraper/article-content.service';

interface ApiResponse {
  posts: {
    date: string;
    description: string;
    full_post_url: string;
    post_image_url: string;
    title: string;
  }[];
}

@Injectable()
export class PythonWebScraperService implements IScraper {
  private articleContentService: ArticleContentService;

  constructor() {
    this.articleContentService = new ArticleContentService();
  }

  getName(): string {
    return this.constructor.name;
  }
  canHandle(url: string): boolean {
    // This scraper can handle all URLs
    return false;
  }

  async scrapeArticle(url: string): Promise<NewsWithArticle[]> {
    const apiUrl = 'https://bizzline-api-py-scraper.azurewebsites.net/scrape';
    const apiKey = 'SeW4%ptum0df5TcJSJ0%V';
    const prompt =
      'List all posts with dates in format YYYY-MM-DD HH:MM as date, full post url as full_post_url, title, post image url as post_image_url  with last 5 post';
    const model = 'gpt-4o';

    Logger.debug(`[${this.constructor.name}] scrapeArticle: ${url} `);

    const response = await axios.post<ApiResponse>(
      apiUrl,
      {
        url: url,
        prompt: prompt,
        model: model,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        timeout: 180000,
      },
    );

    if (!response || !response.data) {
      throw new Error(
        `Error fetching article from API: ${JSON.stringify(response)}`,
      );
    }
    console.log(response.data.posts);

    const withArticles: NewsWithArticle[] = [];

    for (const item of response.data.posts) {
      const articleHtml = await this.articleContentService.fetchArticleContent(
        item.full_post_url,
      );
      const parsedDate = parse(item.date, 'yyyy-MM-dd HH:mm', new Date());
      const article: NewsWithArticle = {
        title: item.title,
        link: item.full_post_url,
        date: parsedDate,
        innerText: articleHtml,
        company: 'genericai',
        source: item.full_post_url,
        imageUrl: item.post_image_url,
      };
      withArticles.push(article);
    }

    console.log(withArticles);
    return withArticles;
  }
}
