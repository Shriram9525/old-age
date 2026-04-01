const { CohereClient } = require('cohere-ai');
const cohere = new CohereClient({ token: '7eGZu5pyeiC6PTEhxT8XRS5cmVcuUpQ1S1eyWijT' });

async function run() {
  try {
    const response = await cohere.chat({
      model: 'command-r7b-12-2024',
      message: 'Give a short greeting',
      maxTokens: 200
    });
    console.log("SUCCESS:", response.text);
  } catch(e) {
    console.error("ERROR:", e.message);
  }
}
run();
