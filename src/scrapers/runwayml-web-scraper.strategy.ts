import { IScraper } from './scraper.interface';
import { Logger } from '@nestjs/common';
import { NewsWithArticle } from '../scraper/news.type';
import * as cheerio from 'cheerio';
import { ArticleContentService } from '../scraper/article-content.service';

export class RunwayMLWebScraperService implements IScraper {
  private articleContentService: ArticleContentService;

  constructor() {
    this.articleContentService = new ArticleContentService();
  }
  canHandle(url: string): boolean {
    //https://runwayml.com/blog/
    return /^https?:\/\/.*runwayml.*\//i.test(url);
  }

  async scrapeArticle(url: string): Promise<NewsWithArticle[]> {
    try {
      if (!/^https?:\/\/.*runwayml.*\//i.test(url)) {
        throw new Error('Invalid URL. Only RunawayMl URLs are allowed.');
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error fetching article: ${response.statusText}`);
      }
      const html = await response.text();
      const $ = cheerio.load(html);

      let newsItems: NewsWithArticle[] = [];

      const scriptContent = $('#__NEXT_DATA__').text();

      // Parse the JSON content
      let jsonData;
      try {
        jsonData = JSON.parse(scriptContent);
      } catch (e) {
        console.error('Error parsing JSON:', e);
        return;
      }

      // Accessing the data within the JSON object
      if (
        jsonData &&
        jsonData.props &&
        jsonData.props.pageProps &&
        jsonData.props.pageProps.posts
      ) {
        const posts = jsonData.props.pageProps.posts;

        newsItems = await Promise.all(
          posts.map(async (item) => {
            const articleHtml =
              await this.articleContentService.fetchArticleContent(
                `https://runwayml.com/blog/${item.slug}`,
              );

            let imageUrl = item.thumbnail;

            // Check if imageUrl is relative and prepend domain if necessary
            if (imageUrl && !imageUrl.startsWith('http')) {
              imageUrl = `https://runwayml.com${imageUrl}`;
            }

            return {
              title: item.title,
              link: `https://runwayml.com/blog/${item.slug}`,
              date: new Date(item.date),
              source: 'RunwayML Website',
              company: 'runwayml',
              innerText: articleHtml,
              imageUrl: imageUrl,
            };
          }),
        );
      } else {
        console.log('No posts found');
      }

      return newsItems;
    } catch (error) {
      Logger.error(
        `[RunwayMLWebScraperService] error scraping article: ${error.message}`,
      );
    }
  }
}
