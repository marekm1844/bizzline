import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import {
  OutputFixingParser,
  StructuredOutputParser,
} from 'langchain/output_parsers';
import { ZodType } from 'zod';
import { ArticleSchema } from './article-llm.schema';
import { GET_ARTICLE } from './prompts';
import { SystemMessage } from 'langchain/schema';

@Injectable()
export class GptSummaryService {
  private readonly openAI: ChatOpenAI;
  private readonly parser: StructuredOutputParser<ZodType>;

  constructor(private configService: ConfigService) {
    this.openAI = new ChatOpenAI({
      temperature: 0.2,
      openAIApiKey: this.configService.get<string>('OPENAI_API_KEY'),
      modelName: 'gpt-3.5-turbo-1106',
    });

    this.parser = StructuredOutputParser.fromZodSchema(ArticleSchema);
  }

  private async pareseOutput(
    output: string,
  ): Promise<(typeof ArticleSchema)['_type']> {
    let parsedOutput;
    try {
      parsedOutput = await this.parser.parse(output);
    } catch (error) {
      const fixParser = OutputFixingParser.fromLLM(this.openAI, this.parser);
      parsedOutput = await fixParser.parse(output);
    }

    return ArticleSchema.parse(parsedOutput);
  }

  async generateJsonSummary(
    articleText: string,
  ): Promise<(typeof ArticleSchema)['_type']> {
    const formatInstructions = this.parser.getFormatInstructions();
    GET_ARTICLE.partialVariables = { formatInstructions };

    const finalPrompt = await GET_ARTICLE.format({
      newsStory: articleText,
    });

    const response = await this.openAI.call([new SystemMessage(finalPrompt)]);
    const output = await this.pareseOutput(response.content.toString());

    return output;
  }
}
