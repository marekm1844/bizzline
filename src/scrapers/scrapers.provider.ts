// src/scrapers/scraper.providers.ts
import { Logger } from '@nestjs/common';
import { IScraper } from './scraper.interface';
import { readdirSync } from 'fs';
import { join } from 'path';

export async function loadScrapers(): Promise<IScraper[]> {
  const scrapers: IScraper[] = [];
  const scrapersDir = join(__dirname); // Adjust the path to your scrapers directory
  const scraperFiles = readdirSync(scrapersDir).filter((file) =>
    file.endsWith('.strategy.js'),
  );

  for (const file of scraperFiles) {
    const modulePath = join(scrapersDir, file);
    const module = await import(modulePath);
    Object.keys(module).forEach((key) => {
      const exportedEntity = module[key];
      if (typeof exportedEntity === 'function') {
        const instance: IScraper = new exportedEntity();
        scrapers.push(instance);
      }
    });
  }

  Logger.log(`Loaded ${scrapers.length} scrapers`);
  return scrapers;
}
