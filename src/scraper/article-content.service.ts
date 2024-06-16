// article-content.service.ts
import { Injectable, Logger } from '@nestjs/common';
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

        if (htmlContent.includes('Verifying you are human')) {
          throw new Error('Verifying you are human');
        }
      } catch (playwrightError) {
        console.error('Playwright fetching error:', playwrightError);
        await browser.close();
        // Fallback to API
        try {
          const apiResponse = await this.fetchArticleContentFromApi(url);
          return apiResponse;
        } catch (apiError) {
          console.error('API fetching error:', apiError);
          throw apiError;
        }
      }
    }
    // Cleaning HTML content
    const value = this.cleanHtmlContent(htmlContent);
    if (value.length > 45000) {
      const apiResponse = await this.fetchArticleContentFromApi(url);
      return apiResponse;
    }
    return value;
  }

  private async fetchArticleContentFromApi(url: string): Promise<string> {
    const apiUrl = 'https://bizzline-api-py-scraper.azurewebsites.net/scrape';
    const apiKey = 'SeW4%ptum0df5TcJSJ0%V';
    const prompt =
      'Write summary of article as one long article (long_article_description) writen in news-style writing style';
    const model = 'gpt-3.5-turbo';

    try {
      const response = await axios.post(
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

      Logger.debug(
        `[${this.constructor.name}] response: ${JSON.stringify(response.data)}`,
      );
      if (!response || !response.data) {
        throw new Error(
          `Error fetching article from API: ${JSON.stringify(response)}`,
        );
      }

      return response.data.long_article_description;
    } catch (error) {
      console.error('Error fetching article from API:', error);
      throw error;
    }
  }

  private cleanHtmlContent(htmlContent: string): string {
    const $ = cheerio.load(htmlContent);

    // Remove script and style tags
    $('script, style').remove();

    /**
      const images = $('img')
        .map((_, img) => $(img).attr('src'))
        .get();
      const imageUrls = images.filter((src): src is string => !!src).join('\n');
    */

    // Get text content
    return $('body').text();
  }
}
