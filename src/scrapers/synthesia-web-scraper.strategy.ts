import { Logger } from '@nestjs/common';
import { ArticleContentService } from '../scraper/article-content.service';
import { NewsWithArticle } from '../scraper/news.type';
import { IScraper } from './scraper.interface';
import * as cheerio from 'cheerio';

export class SynthesiaWebScraperService implements IScraper {
  private articleContentService: ArticleContentService;

  constructor() {
    this.articleContentService = new ArticleContentService();
  }
  canHandle(url: string): boolean {
    //https://www.synthesia.io/blog/category/synthesia-news
    return /^https?:\/\/.*synthesia.io.*\//i.test(url);
  }
  async scrapeArticle(url): Promise<NewsWithArticle[]> {
    if (!this.canHandle(url)) {
      throw new Error('Invalid URL. Only cohare URLs are allowed.');
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error fetching article: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const newsItems = [];

    $('.case-studies-collection-item').each((_, element) => {
      const title = $(element).find('h3.paragraph-1.medium').text().trim();
      const link =
        'https://www.synthesia.io' + $(element).find('a').attr('href');
      // Assuming the date is present in a specific format or tag, which needs to be identified
      const date = null;
      const source = 'Synthesia Website';
      const company = 'synthesia';
      const imageUrl = $(element)
        .find('.webinars-thumbnail-container img')
        .attr('src');
      Logger.debug(
        `[${this.constructor.name}] scrapeArticle: ${title} ${link} Date: ${date} ${source} ${company} ${imageUrl} `,
      );
      newsItems.push({ title, link, date, source, company, imageUrl });
    });

    function isUnique(
      value: NewsWithArticle,
      index: number,
      array: NewsWithArticle[],
    ) {
      return (
        array.findIndex(
          (item) => item.title === value.title && item.link === value.link,
        ) === index
      );
    }

    const distinctValues = newsItems.filter(isUnique);

    const withArticles: NewsWithArticle[] = await Promise.all(
      distinctValues.map(async (item) => {
        const articleHtml =
          await this.articleContentService.fetchArticleContent(item.link);
        return {
          ...item,
          date: item.date,
          innerText: articleHtml,
        };
      }),
    );

    return withArticles;
  }
}
