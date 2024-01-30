// article-content.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { chromium } from 'playwright';
import * as cheerio from 'cheerio';

@Injectable()
export class ArticleContentService {
  async fetchArticleContent(url: string): Promise<string> {
    let htmlContent = '';

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        },
      });
      htmlContent = response.data; // Return the HTML content of the page
    } catch (error) {
      console.error('Axios fetching error, trying with Playwright:');

      // Fallback to Playwright
      const browser = await chromium.launch();
      const page = await browser.newPage();
      try {
        await page.goto(url, { waitUntil: 'networkidle' });
        htmlContent = await page.content();
        await browser.close();
      } catch (playwrightError) {
        console.error('Playwright fetching error:', playwrightError);
        await browser.close();
        throw playwrightError;
      }
    }
    // Cleaning HTML content
    return this.cleanHtmlContent(htmlContent);
  }

  private cleanHtmlContent(htmlContent: string): string {
    const $ = cheerio.load(htmlContent);

    // Remove script and style tags
    $('script, style').remove();

    // Get text content
    return $('body').text();
  }
}
