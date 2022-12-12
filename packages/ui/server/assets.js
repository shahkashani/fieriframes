const express = require('express');
const app = express();
const port = 3001;
const { readFileSync, existsSync, statSync, writeFileSync } = require('fs');
const { resolve, parse } = require('path');
const cors = require('cors');
const { compact } = require('lodash');

const PROJECT_FILE = resolve(__dirname, '../project.json');
const RESTART_FILE = resolve(__dirname, '../restart.txt');

let project;
let projectChanged;

app.use(cors());
app.options('*', cors());
app.use(express.static('static'));

const safeStatSync = (url) => {
  try {
    return statSync(url);
  } catch (err) {
    return { mtimeMs: Date.now() };
  }
};

app.post('/restart', (req, res) => {
  writeFileSync(RESTART_FILE, Date.now().toString());
  res.sendStatus(200);
});

app.get('/project', async (req, res) => {
  const host = `http://${req.headers.host}`;

  if (
    !project ||
    (existsSync(PROJECT_FILE) &&
      statSync(PROJECT_FILE).mtimeMs !== projectChanged)
  ) {
    if (existsSync(PROJECT_FILE)) {
      project = JSON.parse(readFileSync(PROJECT_FILE).toString());
      projectChanged = statSync(PROJECT_FILE).mtimeMs;
    } else {
      res.status(404);
      return;
    }
  }
  const {
    assets,
    source: { name },
    captions,
    images: [{ time, length }],
  } = project;

  const images = assets
    .map((image) => {
      if (existsSync(image.url)) {
        const { base } = parse(image.url);
        const { mtimeMs } = safeStatSync(image.url);
        const url = `${host}/${base}?mtime=${mtimeMs}`;
        const { width, height } = image;
        const frames = compact(image.frames.map((frame) => {
          const { url, index } = frame;
          const { base } = parse(url);
          const { mtimeMs } = safeStatSync(url);
          const exists = existsSync(url);
          if (!exists) {
            return null;
          }
          return {
            url: `${host}/${base}?mtime=${mtimeMs}`,
            index,
          };
        }));
        return { url, width, height, frames };
      } else {
        return {
          url: null,
          frames: [],
        };
      }
    })
    .filter((image) => !!image.url);

  const timestamps = project.images.map(({ time }) => time);

  const info = {
    length,
    captions,
    video: name,
    timestamps,
    seconds: time,
  };

  res.json({ images, info });
});

app.listen(port, () => {
  console.log(`Assets listening at http://localhost:${port}`);
});
