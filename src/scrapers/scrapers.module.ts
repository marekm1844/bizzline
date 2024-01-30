// scraper.module.ts
import { Module } from '@nestjs/common';
import { loadScrapers } from './scrapers.provider';

@Module({
  providers: [
    {
      provide: 'SCRAPERS',
      useFactory: async () => await loadScrapers(),
    },
  ],
  exports: ['SCRAPERS'],
})
export class ScrapersModule {}
