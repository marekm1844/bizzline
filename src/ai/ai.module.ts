import { Module } from '@nestjs/common';
import { GptSummaryService } from './llm.service';

@Module({
  providers: [GptSummaryService],
  exports: [GptSummaryService],
})
export class AiModule {}
