const { execFile } = require('child_process');

execFile('python', ['cohere_bot.py', 'health'], (error, stdout, stderr) => {
  if (error) {
    console.error('ERROR:', error);
    console.error('STDERR:', stderr);
  } else {
    console.log('STDOUT:', stdout);
    if (stderr) console.error('STDERR:', stderr);
  }
});
