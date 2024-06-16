import { Inject, Injectable } from '@nestjs/common';
import { IScraper } from '../scrapers/scraper.interface';

@Injectable()
export class ScraperFactory {
  constructor(@Inject('SCRAPERS') private readonly scrapers: IScraper[]) {}
  getScraper(url: string, scraperName: string | null): IScraper {
    let scraper: IScraper;
    if (scraperName) {
      scraper = this.scrapers.find(
        (scraper) => scraper.getName() === scraperName,
      );
      return scraper;
    }

    scraper = this.scrapers.find((scraper) => scraper.canHandle(url));
    if (!scraper) {
      throw new Error('No suitable scraper found');
    }
    return scraper;
  }
}
