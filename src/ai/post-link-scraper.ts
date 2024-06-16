import {
  Browser,
  Page,
  Response,
  PlaywrightWebBaseLoader,
} from 'langchain/document_loaders/web/playwright';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { HtmlToTextTransformer } from '@langchain/community/document_transformers/html_to_text';
import { Document } from 'langchain/dist/document';

export class PostLinkScraper {
  async fetchArticleContent(url: string): Promise<string> {
    const loader = new PlaywrightWebBaseLoader(url);
    const docs = await loader.load();

    const textSplitter = RecursiveCharacterTextSplitter.fromLanguage('html');
    const transformer = new HtmlToTextTransformer();

    const mewDocs = await transformer.transformDocuments(docs);
    //console.log(mewDocs);

    // const newDocuments = await sequence.invoke(docs);

    return 'text';
  }

  private async generateDocumentFromHtml(url: string) {
    const textLoader = new PlaywrightWebBaseLoader(url, {
      launchOptions: {
        headless: true,
      },
      gotoOptions: {
        waitUntil: 'domcontentloaded',
      },
      async evaluate(page: Page, browser: Browser, response: Response | null) {
        if (response?.status() !== 200) {
          throw new Error('Site is unreachable.');
        }

        const result = await page.evaluate(() => {
          ['nav', 'header', 'footer'].forEach((tag) => {
            [...document.body.getElementsByTagName(tag)].forEach((element) => {
              element.remove();
            });
          });
          return document.body.innerText;
        });

        return result;
      },
    });

    const docs: Document[] = await textLoader.load();
  }
}
