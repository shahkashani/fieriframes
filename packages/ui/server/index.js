const express = require('express');
const app = express();
const port = 3000;
const stills = require('stills');
const { writeFileSync, readFileSync, existsSync } = require('fs');
const { resolve } = require('path');

const PROJECT_FILE = resolve(__dirname, '../project.json');
let project;

const instance = new stills.Stills({
  source: new stills.sources.Local({
    folder: resolve(__dirname, '../../../videos'),
    outputFolder: resolve(__dirname, '../static'),
  }),
  content: new stills.content.Gif(),
  caption: new stills.captions.Static({
    captions: ['This is a call to all.'],
  }),
  filters: [
    new stills.filters.Captions({
      font: resolve(__dirname, '../../../fonts/arial.ttf'),
    }),
  ],
});

const getAssets = (instance) => {
  return instance.images.map((image) => {
    const { filename } = image;
    const url = filename;
    const frames = image.frames.frames.map((frame) => {
      const { edited } = frame;
      return {
        url: edited,
      };
    });
    return { frames, url };
  });
};

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
