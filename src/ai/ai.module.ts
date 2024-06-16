import { Module } from '@nestjs/common';
import { GptSummaryService } from './llm.service';
import { DocumentService } from './document.service';
import { ArticleListLLMService } from './article-list-llm.service';

@Module({
  providers: [GptSummaryService, DocumentService, ArticleListLLMService],
  exports: [GptSummaryService, DocumentService],
})
export class AiModule {}
