const { CohereClientV2 } = require('cohere-ai');
const cohere = new CohereClientV2({ token: '7eGZu5pyeiC6PTEhxT8XRS5cmVcuUpQ1S1eyWijT' });

async function run() {
  try {
    const response = await cohere.chat({
      model: 'command-r-plus',
      messages: [{ role: 'user', content: 'hello' }]
    });
    console.log(JSON.stringify(response, null, 2));
  } catch(e) {
    console.error(e);
  }
}
run();
