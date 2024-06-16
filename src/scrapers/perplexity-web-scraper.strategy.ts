import { Logger } from '@nestjs/common';
import { ArticleContentService } from '../scraper/article-content.service';
import { NewsWithArticle } from '../scraper/news.type';
import { IScraper } from './scraper.interface';
import * as cheerio from 'cheerio';
import { parse } from 'date-fns';

export class PerplexityWebScraperService implements IScraper {
  private articleContentService: ArticleContentService;

  constructor() {
    this.articleContentService = new ArticleContentService();
  }

  getName(): string {
    return this.constructor.name;
  }
  canHandle(url: string): boolean {
    //https://blog.perplexity.ai/
    return /^https?:\/\/.*perplexity.ai.*\//i.test(url);
  }
  async scrapeArticle(url): Promise<NewsWithArticle[]> {
    if (!this.canHandle(url)) {
      throw new Error('Invalid URL. Only perplexity URLs are allowed.');
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error fetching article: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const newsItems = [];

    $('.framer-1qwgol9-container').each((_, container) => {
      $(container)
        .find('.framer-H5DcG')
        .each((_, element) => {
          const title = $(element).find('h4.framer-text').text().trim();
          const link =
            'https://blog.perplexity.ai/blog' +
            $(element).find('a').attr('href').replace('./blog', '');
          const imageUrl = $(element).find('img').attr('src');
          //const content = $(element).find('p.framer-text').text().trim();
          const date = $(element).find('.framer-tygmxj p').text().trim();
          const source = 'Perplexity  Website';
          const company = 'perplexity';

          Logger.debug(
            `[${this.constructor.name}] scrapeArticle: ${title} ${link} Date: ${date} ${source} ${company} ${imageUrl} `,
          );
          newsItems.push({ title, link, date, source, company, imageUrl });
        });
    });

    $('.framer-7tc4vr-container').each((_, container) => {
      $(container)
        .find('.framer-sGx6I')
        .each((_, element) => {
          const title = $(element).find('h4.framer-text').text().trim();
          const link =
            'https://blog.perplexity.ai/blog' +
            $(element).find('a').attr('href').replace('./blog', '');
          const imageUrl = $(element).find('img').attr('src');
          //const content = $(element).find('p.framer-text').text().trim();
          const date = $(element).find('.framer-1ce0u31 p').text().trim();
          const source = 'Perplexity  Website';
          const company = 'perplexity';

          Logger.debug(
            `[${this.constructor.name}] scrapeArticle: ${title} ${link} Date: ${date} ${source} ${company} ${imageUrl} `,
          );
          newsItems.push({ title, link, date, source, company, imageUrl });
        });
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

    console.log(distinctValues);

    const withArticles: NewsWithArticle[] = await Promise.all(
      distinctValues.map(async (item) => {
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
