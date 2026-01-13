import { retrieveAndAnswer } from './query_engine';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  const query = process.argv[2];
  if (query) {
    console.log(`Analyzing: ${query}...`);
    const answer = await retrieveAndAnswer(query);
    console.log("\nAnswer:\n", answer);
    process.exit(0);
  } else {
    rl.question('Ask about test failures: ', async (q) => {
        const answer = await retrieveAndAnswer(q);
        console.log("\nAnswer:\n", answer);
        rl.close();
    });
  }
}

if (require.main === module) {
  main();
}
