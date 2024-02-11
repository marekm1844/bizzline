import { Logger } from '@nestjs/common';
import { ArticleContentService } from '../scraper/article-content.service';
import { NewsWithArticle } from '../scraper/news.type';
import { IScraper } from './scraper.interface';
import * as cheerio from 'cheerio';
import { parse } from 'date-fns';

export class AnthropicWebScraperService implements IScraper {
  private articleContentService: ArticleContentService;

  constructor() {
    this.articleContentService = new ArticleContentService();
  }
  canHandle(url: string): boolean {
    return /^https?:\/\/.*anthropic.com.*\//i.test(url);
  }
  async scrapeArticle(url): Promise<NewsWithArticle[]> {
    //https://www.anthropic.com/news
    if (!/^https?:\/\/.*anthropic.com.*\//i.test(url)) {
      throw new Error('Invalid URL. Only anthropic.com  URLs are allowed.');
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error fetching article: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const newsItems = [];

    $('.PostCard_post-card___tQ6w').each((index, element) => {
      const title = $(element)
        .find('.PostCard_post-heading__KPsva')
        .text()
        .trim();
      const link = 'https://www.anthropic.com/' + $(element).attr('href');
      const date = $(element).find('.PostList_post-date__giqsu').text().trim();
      const source = 'Anthropic AI Website';
      const company = 'anthropic';
      const imageUrl = $(element)
        .find('.PostCard_post-card-photo__0kcwA img')
        .attr('src');
      let fullImageUrl = '';
      if (imageUrl) {
        fullImageUrl = imageUrl.startsWith('http')
          ? imageUrl
          : `https://www.anthropic.com${imageUrl}`;
      }

      Logger.debug(
        `[${this.constructor.name}] scrapeArticle: ${title} ${link} ${date} ${source} ${company} `,
      );
      newsItems.push({
        title,
        link,
        date,
        source,
        company,
        imageUrl: fullImageUrl,
      });
    });

    const withArticles: NewsWithArticle[] = await Promise.all(
      newsItems.map(async (item) => {
        const articleHtml =
          await this.articleContentService.fetchArticleContent(item.link);
        const parsedDate = parse(item.date, 'MMM dd, yyyy', new Date());
        return {
          ...item,
          date: parsedDate,
          innerText: articleHtml,
        };
      }),
    );

    return withArticles;
  }
}
