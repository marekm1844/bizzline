import { PromptTemplate } from 'langchain/prompts';

const formatInstructions = 'Format instructions: \n';

export const GET_ARTICLE = new PromptTemplate({
  template: `For a given string extract oryginal news artile without changing the text and give summary with 300 characters in length.
     News String: {newsStory}
  
     News String ended above.
     {formatInstructions}

     Here is examples of how to extract the article:
     Example: "Dive Into ClipDrop\nTry DreamStudio\n\n\n\n\n\n\n\n\n\n    \n      \n      \n      \n    \n\n    \n    \n      \n    \n  \n\n  \n    \n      \n        \n          \n            \n              \n\n\n\n  \n  \n    \n    \n    \n  \n\n\n              \n                0\n              \n            \n          \n        \n      \n\n      \n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n  \n\n\n   \n\n    \n      Skip to Content\n    \n    \n\n\n\n    \n    \n    \n    \n\n    \n      \n      \n\n      \n        \n\n        \n\n        \n\n        \n\n        \n\n        \n        \n          \n          \n          \n        \n          \n          \n          \n            \n\n            \n\n            \n              \n              \n              \n                \n                  \n                    \n                      \n                      \n\n\n                      \n                    \n\n                  \n                  \n                    \n                      \n                        \n\n\n                      \n                    \n                  \n                \n              \n            \n              \n              \n              \n                \n                  \n                    \n\n\n  \n    \n      \n        Models\n      \n      \n        \n          \n            \n              \n                \n                  Audio\n                \n              \n            \n          \n          \n        \n          \n            \n              \n                \n                  Image \n                \n              \n            \n          \n          \n        \n          \n            \n              \n                \n                  Language\n                \n              \n            \n          \n          \n        \n          \n            \n              \n                \n                  Video\n                \n              \n            \n          \n          \n        \n          \n            \n              \n                \n                  3D\n                \n              \n            \n          \n          \n        \n      \n    \n  \n  \n\n\n  \n    \n      \n        Membership\n      \n    \n  \n  \n  \n\n\n  \n    \n      \n        API\n      \n      \n        \n          \n          \n            \n              API Platform ↗\n            \n          \n        \n          \n          \n            \n              API Documentation ↗\n            \n          \n        \n          \n          \n            \n              API Pricing ↗\n            \n          \n        \n      \n    \n  \n  \n\n\n  \n    \n      \n        Company\n      \n      \n        \n          \n            \n              \n                \n                  About\n                \n              \n            \n          \n          \n        \n          \n            \n              \n                \n                  Partners\n                \n              \n            \n          \n          \n        \n          \n            \n              \n                \n                  Research\n                \n              \n            \n          \n          \n        \n          \n            \n              \n                \n                  Careers\n                \n              \n            \n          \n          \n        \n      \n    \n  \n  \n\n\n  \n    \n      \n        News\n      \n    \n  \n  \n  \n\n\n    \n      日本語\n    \n  \n\n\n\n\n                  \n                \n              \n            \n            \n          \n        \n          \n          \n          \n            \n              \n            \n            \n\n            \n\n          \n          \n\n            \n            \n              \n            \n\n            \n            \n              \n            \n\n            \n              \n                \n                  Contact Us\n                \n              \n            \n          \n        \n          \n\n\n\n\n\n\n  \n    Open Menu\n    Close Menu\n    \n      \n        \n        \n        \n      \n    \n  \n\n\n        \n        \n        \n        \n        \n\n      \n      \n        \n          \n          \n          \n        \n          \n          \n          \n            \n\n            \n\n            \n              \n              \n              \n                \n                  \n                    \n                      \n                      \n\n\n                      \n                    \n\n                  \n                  \n                    \n                      \n                        \n\n\n                      \n                    \n                  \n                \n              \n            \n              \n              \n              \n                \n                  \n                    \n\n\n  \n    \n      \n        Models\n      \n      \n        \n          \n            \n              \n                \n                  Audio\n                \n              \n            \n          \n          \n        \n          \n            \n              \n                \n                  Image \n                \n              \n            \n          \n          \n        \n          \n            \n              \n                \n                  Language\n                \n              \n            \n          \n          \n        \n          \n            \n              \n                \n                  Video\n                \n              \n            \n          \n          \n        \n          \n            \n              \n                \n                  3D\n                \n              \n            \n          \n          \n        \n      \n    \n  \n  \n\n\n  \n    \n      \n        Membership\n      \n    \n  \n  \n  \n\n\n  \n    \n      \n        API\n      \n      \n        \n          \n          \n            \n              API Platform ↗\n            \n          \n        \n          \n          \n            \n              API Documentation ↗\n            \n          \n        \n          \n          \n            \n              API Pricing ↗\n            \n          \n        \n      \n    \n  \n  \n\n\n  \n    \n      \n        Company\n      \n      \n        \n          \n            \n              \n                \n                  About\n                \n              \n            \n          \n          \n        \n          \n            \n              \n                \n                  Partners\n                \n              \n            \n          \n          \n        \n          \n            \n              \n                \n                  Research\n                \n              \n            \n          \n          \n        \n          \n            \n              \n                \n                  Careers\n                \n              \n            \n          \n          \n        \n      \n    \n  \n  \n\n\n  \n    \n      \n        News\n      \n    \n  \n  \n  \n\n\n    \n      日本語\n    \n  \n\n\n\n\n                  \n                \n              \n            \n            \n          \n        \n          \n          \n          \n            \n              \n            \n            \n\n            \n\n          \n          \n\n            \n            \n              \n            \n\n            \n            \n              \n            \n\n            \n              \n                \n                  Contact Us\n                \n              \n            \n          \n        \n          \n\n\n\n\n\n\n  \n    Open Menu\n    Close Menu\n    \n      \n        \n        \n        \n      \n    \n  \n\n\n        \n        \n        \n        \n        \n      \n    \n  \n  \n  \n    \n    \n      \n        \n          \n\n\n\n  \n    \n      \n        Folder:\n        Models\n        \n      \n    \n  \n  \n    \n    \n      \n        Back\n      \n    \n    \n    \n      \n        \n          Audio\n        \n      \n    \n    \n    \n      \n        \n          Image \n        \n      \n    \n    \n    \n      \n        \n          Language\n        \n      \n    \n    \n    \n      \n        \n          Video\n        \n      \n    \n    \n    \n      \n        \n          3D\n        \n      \n    \n    \n    \n  \n\n  \n    \n      \n        Membership\n      \n    \n  \n\n  \n    \n      \n        Folder:\n        API\n        \n      \n    \n  \n  \n    \n    \n      \n        Back\n      \n    \n    \n    \n      API Platform ↗\n    \n    \n    \n      API Documentation ↗\n    \n    \n    \n      API Pricing ↗\n    \n    \n    \n  \n\n  \n    \n      \n        Folder:\n        Company\n        \n      \n    \n  \n  \n    \n    \n      \n        Back\n      \n    \n    \n    \n      \n        \n          About\n        \n      \n    \n    \n    \n      \n        \n          Partners\n        \n      \n    \n    \n    \n      \n        \n          Research\n        \n      \n    \n    \n    \n      \n        \n          Careers\n        \n      \n    \n    \n    \n  \n\n  \n    \n      \n        News\n      \n    \n  \n\n  \n    日本語\n  \n\n\n\n  \n    \n  Login\n  Account\n\n  \n\n\n\n          \n          \n          \n          \n            \n              Contact Us\n            \n          \n          \n        \n      \n    \n  \n\n\n\n      \n        \n          \n\n  \n  \n    \n    \n\n\n  \n\n\n\n  \n    \n    \n      \n    \n    \n  \n  \n    \n      \n      \n      \n      \n      \n      \n      \n  \n  \n    \n      \n        \n          Introducing Our New SVP of Integrity, Ella Irwin\n        \n        \n          \n            \n              Company\n            \n          \n\n          \n            \n              8 Jan\n            \n            Written By Design Team\n          \n        \n      \n\n      \n        \n\n\n  The rapidly evolving field of generative AI presents tremendous opportunities for individuals, businesses, and humanity at large, yet it also poses considerable challenges. With this in mind, Stability AI sought the best and brightest talent to lead our efforts aligned with ethical guidance and responsible innovation to optimize the positive impact our technology brings to the world. We are thrilled to announce the addition of renowned trust and safety leader Ella Irwin to the Stability AI team as our first SVP of Integrity.In this role, Ella will establish principles and spearhead solutions that set the standard for the AI industry globally. Her leadership will be crucial as we scale our technology to meet growing demands while maintaining our commitment to democratizing creativity. “Ella’s leadership elevates our competitive edge in responsible, accessible AI innovation,” said Stability AI CEO, Emad Mostaque. “Her pioneering vision and technical expertise in product safety will be invaluable as we enter our next phase of growth, and her addition to our leadership team underscores Stability AI’s dedication to shaping AI's future responsibly.”With more than 20 years of leading product integrity teams at top tech companies and financial services institutions, Ella has made it her life's work to develop product features and scaled systems that protect consumers and businesses from harm and abuse globally. Her technology experience spans companies at the forefront of innovation, including  X (Twitter), Twilio, Amazon, and Google.\"I am thrilled to be at the forefront of one of the most fascinating and challenging matters facing the technology industry today and connect with Stability AI’s mission to democratize AI and activate humanity’s potential,\" said Ella. “Stability AI is a disruptive company that has transparency and openness at its core, which tightly aligns with my philosophy around building trust through transparency.”This role was created because we understand the challenges ahead in steering this powerful technology. Ella knows better than anyone that progress requires perseverance. And for those willing to keep innovating for an open and emboldened future, the future is bright.\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n  \n  \n\n\n\n\n\n        \n\n        \n        \n          \n            \n  \n    \n      \n    \n  \n  Design Team\n\n\n\n\n          \n        \n      \n\n      \n        \n          \n            \n          \n        \n      \n    \n  \n\n\n\n    \n  \n  \n  \n\n\n  \n\n\n\n          \n\n          \n            \n              \n  \n  \n  \n    \n      \n        \n        Next\n        Next\n        \n        Stable Video Diffusion Now Available on Stability AI Developer Platform API\n      \n      \n        \n          \n        \n      \n    \n  \n\n\n            \n          \n        \n      \n      \n\n      \n        \n  \n  \n  \n  \n  \n  \n    \n    \n\n\n  \n\n\n\n  \n    \n    \n      \n    \n    \n  \n  \n    \n      \n      \n      \n      \n      \n      \n      \n\n\n  Stability AIHomeCareersStable DigestHPC CenterPress\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n  \n  \n\n\n\n\n\n\n  MembershipStability AI MembershipProfessional Membership Agreement\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n  \n  \n\n\n\n\n\n\n  LegalAcceptable Use PolicyPrivacy PolicyTerms of UseDiscord Terms of ServiceAI Act Suggested Amendments\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n  \n  \n\n\n\n\n\n\n  Contact Uspress@stability.aipartners@stability.ai\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n  \n  \n\n\n\n\n\n\n  Join Our Newsletter\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n  \n  \n\n\n\n\n\n\n\n\n  \n  \n    \n      \n        \n          \n          \n        \n      \n    \n      \n        \n          \n          \n        \n      \n    \n      \n        \n          \n          \n        \n      \n    \n      \n        \n          \n          \n        \n      \n    \n  \n\n\n\n\n  © STABILITY AI LTD, 2023\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n  \n  \n\n\n\n\n    \n  \n  \n  \n\n\n  \n\n\n      \n    \n\n    \n    \n\n\n\n\n\n\n\n  \n\n"

     How should output look: "The rapidly evolving field of generative AI presents tremendous opportunities for individuals, businesses, and humanity at large, yet it also poses considerable challenges. With this in mind, Stability AI sought the best and brightest talent to lead our efforts aligned with ethical guidance and responsible innovation to optimize the positive impact our technology brings to the world. We are thrilled to announce the addition of renowned trust and safety leader Ella Irwin to the Stability AI team as our first SVP of Integrity.

     In this role, Ella will establish principles and spearhead solutions that set the standard for the AI industry globally. Her leadership will be crucial as we scale our technology to meet growing demands while maintaining our commitment to democratizing creativity. 
     
     “Ella’s leadership elevates our competitive edge in responsible, accessible AI innovation,” said Stability AI CEO, Emad Mostaque. “Her pioneering vision and technical expertise in product safety will be invaluable as we enter our next phase of growth, and her addition to our leadership team underscores Stability AI’s dedication to shaping AI's future responsibly.”
     
     With more than 20 years of leading product integrity teams at top tech companies and financial services institutions, Ella has made it her life's work to develop product features and scaled systems that protect consumers and businesses from harm and abuse globally. Her technology experience spans companies at the forefront of innovation, including  X (Twitter), Twilio, Amazon, and Google.
     
     "I am thrilled to be at the forefront of one of the most fascinating and challenging matters facing the technology industry today and connect with Stability AI’s mission to democratize AI and activate humanity’s potential," said Ella. “Stability AI is a disruptive company that has transparency and openness at its core, which tightly aligns with my philosophy around building trust through transparency.”
     
     This role was created because we understand the challenges ahead in steering this powerful technology. Ella knows better than anyone that progress requires perseverance. And for those willing to keep innovating for an open and emboldened future, the future is bright."

     Summary output: "Stability AI appoints Ella Irwin as SVP of Integrity, bringing her 20+ years of tech industry experience. She will guide ethical AI practices and innovation, aligning with the company's commitment to responsible growth and creativity democratization."
     `,
  inputVariables: ['newsStory'],
  partialVariables: { formatInstructions },
});