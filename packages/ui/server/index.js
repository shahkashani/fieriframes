const express = require('express');
const app = express();
const port = 3000;
const stills = require('stills');
const { writeFileSync, readFileSync, existsSync, unlinkSync } = require('fs');
const { resolve } = require('path');
const sizeOf = require('image-size');

require('dotenv').config({ path: resolve(__dirname, '../../../.env') });

const PROJECT_FILE = resolve(__dirname, '../project.json');
let project;

const {
  MICROSOFT_AZURE_TOKEN,
  TUMBLR_CONSUMER_KEY,
  TUMBLR_CONSUMER_SECRET,
  TUMBLR_ACCESS_TOKEN_KEY,
  TUMBLR_ACCESS_TOKEN_SECRET,
  TUMBLR_BLOG_NAME,
} = process.env;

const TUMBLR_CONFIG = {
  consumerKey: TUMBLR_CONSUMER_KEY,
  consumerSecret: TUMBLR_CONSUMER_SECRET,
  token: TUMBLR_ACCESS_TOKEN_KEY,
  tokenSecret: TUMBLR_ACCESS_TOKEN_SECRET,
  blogName: TUMBLR_BLOG_NAME,
  publishState: 'draft',
};

const instance = new stills.Stills({
  analysis: new stills.analysis.Azure({
    token: MICROSOFT_AZURE_TOKEN,
  }),
  source: new stills.sources.Local({
    folder: resolve(__dirname, '../../../videos'),
    outputFolder: resolve(__dirname, '../static'),
  }),
  description: new stills.descriptions.Captions(),
  content: new stills.content.Gif(),
  caption: new stills.captions.Static({
    captions: ['Hello!'],
  }),
  destinations: [new stills.destinations.Tumblr(TUMBLR_CONFIG)],
  filters: [
    new stills.filters.Captions({
      font: resolve(__dirname, '../../../fonts/arial.ttf'),
    }),
  ],
  imageFilters: [
    [
      new stills.filters.Tint(),
    ],
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

app.get('/post', async (req, res) => {
  await instance.generateMetaInfo();
  await instance.post();
  res.sendStatus(200);
});

const restore = async () => {
  project = JSON.parse(readFileSync(PROJECT_FILE).toString());
  console.log('Restoring project', project);
  await instance.restore(project);
  // instance.reset();
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
  // instance.applyFilters();
})();
