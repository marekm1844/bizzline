import { PromptTemplate } from 'langchain/prompts';

const formatInstructions = 'Format instructions: \n';

export const GET_ARTICLE = new PromptTemplate({
  template: `
  Given a string of news text from any source, your task is to transform and summarize the information into a news-style article, including a compelling post title. Follow these guidelines for the summary and title:

  For the Article:
  Reframe the content in the third person: Avoid using first-person plural (e.g., "we", "our") and instead report on company in the article and its developments as an external entity.
  Adopt a formal and informative tone: Ensure the language used is suitable for a wide audience, resembling the style of traditional news reporting.
  Paraphrase significantly: While extracting key information, rewrite the content to avoid copying the original language directly. Aim to provide a fresh perspective that still accurately reflects the original post.
  Structure the article into 2 to 4 paragraphs, seperated with BBCode: [tr][td] [/td][/tr] [tr][td] [/td][/tr], making sure the entire summary is between 200 to 400 words.
  Exclude any HTML code, terms of service, references, the article title, or the word 'summary' in the final output.
  
  Provide an additional brief summary that is no more than 200 characters in length.
  
  For the Post Title:
  Create a compelling title that encapsulates the main point of the article in a succinct, engaging manner.
  Use journalistic style: The title should be informative, capturing the essence of the news story, and written in the third person.
  Ensure clarity and relevance: The title must clearly relate to the content of the summary and be interesting to potential readers.
  
  Requirements for BBCode formatting:
  - Use [table] [/table] tags to wrap the whole article.
  - Separate paragraphs with [tr][td] [/td][/tr] [tr][td] [/td][/tr] tags, ensuring there is a new line after each paragraph.
  - Ensure all BBCode tags are correctly opened and closed.
  - The brief summary follow the structured content.

     News String: {newsStory}
  
     News String ended above.
     {formatInstructions}
     `,
  inputVariables: ['newsStory'],
  partialVariables: { formatInstructions },
});
