const { resolve, parse } = require('path');
const { sync } = require('glob');
const { readFileSync } = require('fs');
const parseSrt = require('parse-srt');

const FOLDER = resolve(__dirname, '../../../captions/ddd');

let db;

const sanitize = (string) =>
  string.replace(/(<([^>]+)>)/gi, '').replace(/\s{2,}/g, ' ');

const createDb = async () => {
  const files = sync(`**.srt`, { cwd: FOLDER });
  return files.map((file) => {
    return {
      name: parse(file).name,
      srt: parseSrt(readFileSync(`${FOLDER}/${file}`).toString()),
    };
  });
};

module.exports = async (q, isPartial = true) => {
  if (!db) {
    db = await createDb();
  }
  const results = [];
  const regexp = isPartial ? new RegExp(q, 'i') : new RegExp(`\\b${q}\\b`, 'i');
  for (const srt of db) {
    for (const line of srt.srt) {
      const { text, start } = line;
      const clean = sanitize(text);
      if (regexp.test(clean)) {
        results.push({
          title: clean,
          id: `${srt.name}:${start}`,
          data: {
            name: srt.name,
            seconds: start,
          },
        });
      }
    }
  }
  return results.slice(-1000);
};
