const express = require('express');
const app = express();
const port = 3000;
const stills = require('stills');
const { writeFileSync, readFileSync, existsSync, unlinkSync } = require('fs');
const { resolve } = require('path');
const sizeOf = require('image-size');

const PROJECT_FILE = resolve(__dirname, '../project.json');
let project;

const instance = new stills.Stills({
  source: new stills.sources.Local({
    folder: resolve(__dirname, '../../../videos'),
    outputFolder: resolve(__dirname, '../static'),
  }),
  content: new stills.content.Gif(),
  caption: new stills.captions.Static({
    captions: ['Et in Arcadia ego.'],
  }),
  filters: [
    new stills.filters.Arcana(),
    new stills.filters.Captions({
      font: resolve(__dirname, '../../../fonts/arial.ttf'),
    }),
  ],
});

const getAssets = (instance) => {
  return instance.images.map((image) => {
    const { filename } = image;
    const url = filename;
    const dimensions = sizeOf(filename);
    const frames = image.frames.frames.map((frame) => {
      const { edited } = frame;
      return {
        url: edited,
      };
    });
    return { frames, url, ...dimensions };
  });
};

app.get('/reset', async (req, res) => {
  if (existsSync(PROJECT_FILE)) {
    unlinkSync(PROJECT_FILE);
  }
  await instance.delete();
  await setup();
  res.sendStatus(200);
});

app.get('/apply', async (req, res) => {
  instance.reset();
  await instance.applyFilters();
  res.sendStatus(200);
});

const restore = async () => {
  project = JSON.parse(readFileSync(PROJECT_FILE).toString());
  console.log('Restoring project', project);
  await instance.restore(project);
  instance.reset();
};

const setup = async () => {
  if (existsSync(PROJECT_FILE)) {
    return await restore();
  }
  const project = await instance.setup();
  project.assets = getAssets(instance);
  writeFileSync(PROJECT_FILE, JSON.stringify(project, null, 2));
};

(async () => {
  await setup();

  app.use(express.static('dist'));
  app.use(express.static('static'));

  app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
  });

  instance.applyFilters();
})();
