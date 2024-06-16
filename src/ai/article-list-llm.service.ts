import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import {
  OutputFixingParser,
  StructuredOutputParser,
} from 'langchain/output_parsers';
import { ZodType } from 'zod';
import { GET_ARTICLE_LIST } from './prompts';
import { SystemMessage } from 'langchain/schema';
import { ArticleListSchema } from './article-list.schema';

@Injectable()
export class ArticleListLLMService {
  private readonly openAI: ChatOpenAI;
  private readonly parser: StructuredOutputParser<ZodType>;

  constructor(private configService: ConfigService) {
    this.openAI = new ChatOpenAI({
      temperature: 0.2,
      openAIApiKey: this.configService.get<string>('OPENAI_API_KEY'),
      modelName: 'gpt-4o',
      //maxTokens: 4096,
    });

    this.parser = StructuredOutputParser.fromZodSchema(ArticleListSchema);
  }

  private async pareseOutput(
    output: string,
  ): Promise<(typeof ArticleListSchema)['_type']> {
    let parsedOutput;
    try {
      parsedOutput = await this.parser.parse(output);
    } catch (error) {
      const fixParser = OutputFixingParser.fromLLM(this.openAI, this.parser);
      parsedOutput = await fixParser.parse(output);
    }

    return ArticleListSchema.parse(parsedOutput);
  }

  async generateJsonSummary(
    articleText: string,
  ): Promise<(typeof ArticleListSchema)['_type']> {
    const formatInstructions = this.parser.getFormatInstructions();
    GET_ARTICLE_LIST.partialVariables = { formatInstructions };

    const finalPrompt = await GET_ARTICLE_LIST.format({
      newsPage: articleText,
    });

    const response = await this.openAI.call([new SystemMessage(finalPrompt)]);

    const output = await this.pareseOutput(response.content.toString());

    return output;
  }
}
