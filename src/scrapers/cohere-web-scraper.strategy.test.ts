import { Test, TestingModule } from '@nestjs/testing';
import { CohereWebScraperService } from './cohere-web-scraper.strategy';

describe('AppController', () => {
  let cohareWebScraperStrategy: CohereWebScraperService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [CohereWebScraperService],
    }).compile();

    cohareWebScraperStrategy = app.get<CohereWebScraperService>(
      CohereWebScraperService,
    );
  });

  describe('CohareWebScraperStrategy', () => {
    describe('canHandle', () => {
      it('should return true for valid Cohare URL', () => {
        const url = 'https://cohere.com/newsroom/articles';
        expect(cohareWebScraperStrategy.canHandle(url)).toBe(true);
      });

      it('should return false for invalid Cohare URL', () => {
        const url = 'https://example.com';
        expect(cohareWebScraperStrategy.canHandle(url)).toBe(false);
      });
    });
  });
});
