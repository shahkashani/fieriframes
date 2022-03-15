const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = 3000;
const stills = require('stills');
const { writeFileSync, readFileSync, existsSync, unlinkSync } = require('fs');
const { resolve, parse } = require('path');
const sizeOf = require('image-size');
const { sync } = require('glob');
const search = require('./search');
const multer = require('multer');

app.use(bodyParser.json());

require('dotenv').config({ path: resolve(__dirname, '../../../.env') });

const PROJECT_FILE = resolve(__dirname, '../project.json');
const BOOKMARKS_FILE = resolve(__dirname, '../bookmarks.json');
const VIDEOS_FOLDER = resolve(__dirname, '../../../videos');

let project;
let instance;

const {
  MICROSOFT_AZURE_TOKEN,
  TUMBLR_CONSUMER_KEY,
  TUMBLR_CONSUMER_SECRET,
  TUMBLR_ACCESS_TOKEN_KEY,
  TUMBLR_ACCESS_TOKEN_SECRET,
  TUMBLR_BLOG_NAME,
  MICROSOFT_COGNITIVE_URL,
  MICROSOFT_COGNITIVE_TOKEN,
} = process.env;

const TUMBLR_CONFIG = {
  consumerKey: TUMBLR_CONSUMER_KEY,
  consumerSecret: TUMBLR_CONSUMER_SECRET,
  token: TUMBLR_ACCESS_TOKEN_KEY,
  tokenSecret: TUMBLR_ACCESS_TOKEN_SECRET,
  blogName: TUMBLR_BLOG_NAME,
  publishState: 'draft',
};

const getInstance = ({ video, seconds } = {}) => {
  const filter = video ? (f) => f.indexOf(`${video}.mp4`) !== -1 : undefined;
  const gifSeconds = parseFloat(seconds) > 0 ? parseFloat(seconds) : undefined;

  return new stills.Stills({
    analysis: new stills.analysis.Azure({
      token: MICROSOFT_AZURE_TOKEN,
    }),
    source: new stills.sources.Local({
      filter,
      folder: VIDEOS_FOLDER,
      outputFolder: resolve(__dirname, '../static'),
    }),
    description: new stills.descriptions.Captions(),
    content: new stills.content.Gif({
      seconds: gifSeconds,
    }),
    caption: new stills.captions.Static({
      captions: ['Hello!'],
    }),
    taggers: [
      new stills.taggers.Episode(),
      new stills.taggers.Static({
        tags: [
          'guy fieri',
          'guyfieri',
          'diners drive-ins and dives',
        ],
      }),
      new stills.taggers.CaptionsCognitive({
        url: MICROSOFT_COGNITIVE_URL,
        token: MICROSOFT_COGNITIVE_TOKEN,
      }),
    ],
    destinations: [new stills.destinations.Tumblr(TUMBLR_CONFIG)],
  });
};

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

const upload = multer({ dest: './.temp' });

instance = getInstance();

app.delete('/frame', async (req, res) => {
  const { index, frame } = req.query;
  await instance.deleteFrame(parseInt(index, 10), parseInt(frame, 10));
  const project = JSON.parse(readFileSync(PROJECT_FILE).toString());
  project.assets[index].frames.splice(frame, 1);
  writeFileSync(PROJECT_FILE, JSON.stringify(project, null, 2));
  res.sendStatus(200);
});

app.post('/replace', upload.single('image'), async (req, res) => {
  const path = resolve(req.file.path);
  const { index, frame } = req.body;
  if (frame) {
    await instance.replaceFrame(parseInt(index, 10), parseInt(frame, 10), path);
  } else {
    await instance.replaceImage(parseInt(index, 10), path);
  }
  unlinkSync(path);
  res.sendStatus(200);
});

app.get('/search', async (req, res) => {
  const { q } = req.query;
  res.json(await search(q));
});

app.get('/bookmarks', async (req, res) => {
  res.json(JSON.parse(readFileSync(BOOKMARKS_FILE).toString()));
});

app.post('/bookmark', async (req, res) => {
  const { video, seconds } = req.body;
  const bookmarks = existsSync(BOOKMARKS_FILE)
    ? JSON.parse(readFileSync(BOOKMARKS_FILE).toString())
    : [];
  bookmarks.push({
    video,
    seconds: parseFloat(seconds),
  });
  writeFileSync(BOOKMARKS_FILE, JSON.stringify(bookmarks, null, 2));
  res.json(bookmarks);
});

app.get('/videos', async (req, res) => {
  files = sync(`*.mp4`, { cwd: VIDEOS_FOLDER }).map((f) => parse(f).name);
  res.json(files);
});

app.get('/reset', async (req, res) => {
  const { video, seconds } = req.query;
  if (existsSync(PROJECT_FILE)) {
    unlinkSync(PROJECT_FILE);
  }
  await instance.delete();

  instance = getInstance({ video, seconds });

  const result = await setup();
  res.json(result);
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
  return project;
};

(async () => {
  await setup();

  app.use(express.static('dist'));
  app.use(express.static(VIDEOS_FOLDER));

  app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
  });
  // instance.applyFilters();
})();
