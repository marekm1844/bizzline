import { Logger } from '@nestjs/common';
import { ArticleContentService } from '../scraper/article-content.service';
import { NewsWithArticle } from '../scraper/news.type';
import { IScraper } from './scraper.interface';
import * as cheerio from 'cheerio';
import { parse } from 'date-fns';

export class InflectionAiWebScraperService implements IScraper {
  private articleContentService: ArticleContentService;

  constructor() {
    this.articleContentService = new ArticleContentService();
  }

  getName(): string {
    return this.constructor.name;
  }
  canHandle(url: string): boolean {
    //https://inflection.ai/blog
    return /^https?:\/\/.*inflection.ai.*\//i.test(url);
  }
  async scrapeArticle(url): Promise<NewsWithArticle[]> {
    if (!this.canHandle(url)) {
      throw new Error('Invalid URL. Only inflection URLs are allowed.');
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error fetching article: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const newsItems = [];

    $('ul.css-2jaz6n.e14frs5r1 > li.css-1p1yrql.e14frs5r2').each(
      (_, element) => {
        const title = $(element).find('h2.css-qarofv.e14frs5r3').text().trim();
        const link = new URL($(element).find('a').attr('href'), url).toString(); // Assuming relative URLs
        const date = $(element).find('div.css-wrxzk1.e14frs5r4').text().trim();
        const source = 'Inflection Website';
        const company = 'inflectionai';
        // Get the noscript content
        const noscriptContent = $(element).find('noscript').html();
        const $noscript = cheerio.load(noscriptContent);

        // Now find the <img> tag within the noscript content and get its src attribute
        const imageUrl = $noscript('picture').find('img').attr('src');

        Logger.debug(
          `[${this.constructor.name}] scrapeArticle: ${title} ${link} Date: ${date} ${source} ${company} ${imageUrl} `,
        );
        newsItems.push({ title, link, date, source, company, imageUrl });
      },
    );

    const withArticles: NewsWithArticle[] = await Promise.all(
      newsItems.map(async (item) => {
        const articleHtml =
          await this.articleContentService.fetchArticleContent(item.link);
        const dateAfterDash = item.date.split('–')[1].trim();
        const parsedDate = parse(dateAfterDash, 'MMMM d, yyyy', new Date()); // Updated date format string
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
