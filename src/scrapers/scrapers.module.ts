// scraper.module.ts
import { Module } from '@nestjs/common';
import { loadScrapers } from './scrapers.provider';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  providers: [
    {
      provide: 'SCRAPERS',
      useFactory: async () => await loadScrapers(),
    },
  ],
  exports: ['SCRAPERS'],
})
export class ScrapersModule {}
