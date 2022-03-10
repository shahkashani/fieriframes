const express = require('express');
const app = express();
const port = 3001;
const { readFileSync, existsSync, statSync } = require('fs');
const { resolve, parse } = require('path');
const cors = require('cors');

const PROJECT_FILE = resolve(__dirname, '../project.json');

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

app.get('/project', async (req, res) => {
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
    images: [{ time }],
  } = project;

  const images = assets
    .map((image) => {
      if (existsSync(image.url)) {
        const { base } = parse(image.url);
        const { mtimeMs } = safeStatSync(image.url);
        const url = `http://localhost:${port}/${base}?mtime=${mtimeMs}`;
        const { width, height } = image;
        const frames = image.frames.map((frame) => {
          const { base } = parse(frame.url);
          const { mtimeMs } = safeStatSync(frame.url);
          return {
            url: `http://localhost:${port}/${base}?mtime=${mtimeMs}`,
          };
        });
        return { url, width, height, frames };
      } else {
        return {
          url: null,
          frames: [],
        };
      }
    })
    .filter((image) => !!image.url);

  const info = {
    video: name,
    seconds: time,
  };

  res.json({ images, info });
});

app.listen(port, () => {
  console.log(`Assets listening at http://localhost:${port}`);
});
