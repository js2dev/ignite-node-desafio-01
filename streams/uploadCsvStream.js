import { parse } from 'csv-parse';
import fs from 'node:fs';;

const csvUrl = new URL('./tasks.csv', import.meta.url);

const stream = fs.createReadStream(csvUrl);

const csvParse = parse({
  delimiter: ',',
  skipEmptyLines: true,
  fromLine: 2
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

(async function run() {
  const lines = stream.pipe(csvParse);

  for await (const line of lines) {
    const [title, description] = line;

    await fetch('http://localhost:3333/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        description,
      })
    });
    
    await sleep(1000);
  }
})();
