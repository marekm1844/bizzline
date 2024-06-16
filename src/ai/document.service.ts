import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Document } from 'langchain/dist/document';
import { HtmlToTextTransformer } from '@langchain/community/document_transformers/html_to_text';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import {
  Browser,
  Page,
  Response,
  PlaywrightWebBaseLoader,
} from 'langchain/document_loaders/web/playwright';
import { ArticleListLLMService } from './article-list-llm.service';
import { ArticleListSchema } from './article-list.schema';

@Injectable()
export class DocumentService {
  constructor(private articleListLLM: ArticleListLLMService) {}

  async fetchArticleContent(
    url: string,
  ): Promise<(typeof ArticleListSchema)['_type']> {
    Logger.debug(`fetchArticleContent: ${url}`);
    // const loader = new PlaywrightWebBaseLoader(url);
    const docs = await this.generateDocumentFromHtml(url);
    //console.log(docs);

    const textSplitter = RecursiveCharacterTextSplitter.fromLanguage('html');
    const transformer = new HtmlToTextTransformer();

    const mewDocs = await transformer.transformDocuments(docs);

    Logger.log('-----------------------------------');
    const input = `${mewDocs[0].pageContent} ${mewDocs[0].metadata}`;
    let modifiedInput = input;
    if (modifiedInput.length > 70000) {
      modifiedInput = modifiedInput.substring(0, 70000);
    }
    // console.log(modifiedInput);
    const list = await this.articleListLLM.generateJsonSummary(modifiedInput);
    console.log(list);

    // const newDocuments = await sequence.invoke(docs);

    return list;
  }

  private async generateDocumentFromHtml(url: string): Promise<Document[]> {
    const textLoader = new PlaywrightWebBaseLoader(url, {
      ...this.getLoaderOptions(),
      gotoOptions: {
        waitUntil: 'domcontentloaded' as const,
      },
    });
    try {
      const docs: Document[] = await textLoader.load();
      //console.log(docs);
      return docs;
    } catch (error) {
      throw new HttpException(
        'Failed to generate document from HTML.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private getLoaderOptions() {
    return {
      launchOptions: {
        headless: true,
      },
      gotoOptions: {
        waitUntil: 'domcontentloaded',
      },
      evaluate: this.customEvaluate,
    };
  }

  private async customEvaluate(
    page: Page,
    browser: Browser,
    response: Response | null,
  ): Promise<string> {
    if (response?.status() !== 200) {
      throw new Error('Site is unreachable.');
    }

    const result = await page.evaluate(() => {
      [
        'nav',
        'footer',
        'path',
        'script',
        'iframe',
        'noscript',
        'w-iframe',
      ].forEach((tag) => {
        [...document.body.getElementsByTagName(tag)].forEach((element) => {
          element.remove();
        });
      });

      return document.body.innerHTML + 'base url:' + document.baseURI;
    });

    return result;
  }
}
