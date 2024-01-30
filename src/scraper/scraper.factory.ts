import { Inject, Injectable } from '@nestjs/common';
import { IScraper } from '../scrapers/scraper.interface';

@Injectable()
export class ScraperFactory {
  constructor(@Inject('SCRAPERS') private readonly scrapers: IScraper[]) {
    console.log(this.scrapers);
  }
  getScraper(url: string): IScraper {
    const scraper = this.scrapers.find((scraper) => scraper.canHandle(url));
    if (!scraper) {
      throw new Error('No suitable scraper found');
    }
    return scraper;
  }
}
