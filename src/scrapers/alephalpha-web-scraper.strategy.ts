import { Logger } from '@nestjs/common';
import { ArticleContentService } from '../scraper/article-content.service';
import { NewsWithArticle } from '../scraper/news.type';
import { IScraper } from './scraper.interface';
import { parse } from 'date-fns';
import { chromium } from 'playwright';

export class AlephAlphaWebScraperService implements IScraper {
  private articleContentService: ArticleContentService;

  constructor() {
    this.articleContentService = new ArticleContentService();
  }
  canHandle(url: string): boolean {
    //https://aleph-alpha.com/news/
    return /^https?:\/\/.*aleph-alpha.*\//i.test(url);
  }
  async scrapeArticle(url): Promise<NewsWithArticle[]> {
    if (!this.canHandle(url)) {
      throw new Error('Invalid URL. Only ScalabilityAi URLs are allowed.');
    }

    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.goto(`${url}#news`, { waitUntil: 'networkidle' });

    /**
      const loadMoreButtonSelector =
        'div[data-rel="ajax-load-more-2"] .alm-load-more-btn.more.btn';
  
      let clickCount = 0;
      while ((await page.isVisible(loadMoreButtonSelector)) && clickCount < 2) {
        await page.waitForSelector(loadMoreButtonSelector, { state: 'visible' });
        await page.click(loadMoreButtonSelector, { force: true });
        await page.waitForLoadState('networkidle');
        // Optional: Add a delay or other conditions as needed
        clickCount++;
      }
    */

    const newsItems = await page.$$eval('.alm-reveal .item', (items) => {
      return items.map((item) => {
        const title = item.querySelector('h4')?.textContent?.trim();
        const link = item.querySelector('a')?.href;
        const date = item.querySelector('.date')?.textContent?.trim();
        const imageUrl = item
          .querySelector('img')
          ?.srcset?.split(',')
          .pop()
          .split(' ')[0];
        const source = 'Aleph-alpha Website';
        const company = 'aleph-alpha';

        // All logic to process the above variables should be here
        // No external references

        return { title, link, date, imageUrl, source, company };
      });
    });

    // Process logging and additional logic here, outside of $$eval
    newsItems.forEach((item) => {
      Logger.debug(`ScrapeArticle: ${item.title} ${item.link} ${item.date}`);
      // Other processing
    });

    await page.close();
    await browser.close();

    const withArticles: NewsWithArticle[] = await Promise.all(
      newsItems.map(async (item) => {
        const articleHtml =
          await this.articleContentService.fetchArticleContent(item.link);

        // Parse the date
        const parsedDate = parse(item.date, 'dd. MMMM yyyy', new Date());
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
