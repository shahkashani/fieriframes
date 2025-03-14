const PORT = process.env.PORT || 3000;
const ASSETS_PORT = process.env.PORT || 3001;

const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const stills = require('stills');
const {
  writeFileSync,
  readFileSync,
  existsSync,
  unlinkSync,
  watchFile,
} = require('fs');
const { resolve, parse } = require('path');
const { sync } = require('glob');
const search = require('./search');
const multer = require('multer');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const assets = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(bodyParser.json());
assets.use(cors());
assets.options('*', cors());

const PARENT_PROJECT_FOLDER = resolve(__dirname, '../../../');

require('dotenv').config({ path: resolve(PARENT_PROJECT_FOLDER, '.env') });

const PROJECT_FILE = resolve(__dirname, '../project.json');
const CONFIG_FILE = resolve(__dirname, '../config.js');
const BOOKMARKS_FILE = resolve(__dirname, '../bookmarks.json');
const VIDEOS_FOLDER = resolve(PARENT_PROJECT_FOLDER, './videos');
const FONTS_FOLDER = resolve(PARENT_PROJECT_FOLDER, './fonts');
const RESTART_FILE = resolve(__dirname, '../restart.txt');

let project;
let instance;

const {
  MICROSOFT_AZURE_TOKEN,
  MICROSOFT_AZURE_URL,
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

const FONT_STYLES = {
  voynich: {
    font: resolve(FONTS_FOLDER, 'voynich2.ttf'),
    fontSize: 1.05,
    color: '#fba155',
  },
  brassia: {
    font: resolve(FONTS_FOLDER, 'brassia.otf'),
    fontSize: 0.9,
    color: '#fba155',
    boxWidth: 0.7,
  },
  arial: { font: resolve(FONTS_FOLDER, 'arial.ttf') },
};

const FONT = 'arial';

const getProject = () => {
  const images =
    project && instance && instance.images
      ? project.images.map((image, imageNum) => {
          const imageInstance = instance.images[imageNum];
          const { base } = parse(image.file);
          const url = `/image/${base}?modified=${imageInstance.modified}`;
          const frames = imageInstance.getFrames().map((frame) => {
            return {
              index: frame.index,
              url: `/still/${imageNum}/${frame.index}.png?modified=${frame.modified}`,
            };
          });
          return {
            ...image,
            url,
            frames,
          };
        })
      : [];

  return { ...project, images };
};

const updateClient = () => io.emit('update', getProject());

const getConfig = () => {
  delete require.cache[require.resolve(CONFIG_FILE)];
  return require(CONFIG_FILE);
};

const getInstance = ({ video, timestamps, length, width } = {}) => {
  const config = getConfig();
  const filter = video ? (f) => f.indexOf(`${video}.mp4`) !== -1 : undefined;
  const gifLength = parseFloat(length) > 0 ? parseFloat(length) : undefined;
  const gifWidth = parseInt(width) > 0 ? parseInt(width) : undefined;
  const noTimestamps =
    !timestamps || timestamps.length === 0 || timestamps[0] === 0;

  return new stills.Stills({
    minFaceConfidence: 0.3,
    useGlyphs: FONT === 'voynich',
    analysis: new stills.analysis.Azure({
      token: MICROSOFT_AZURE_TOKEN,
      url: MICROSOFT_AZURE_URL,
    }),
    source: new stills.sources.Local({
      filter,
      folder: VIDEOS_FOLDER,
      outputFolder: resolve(__dirname, '../static'),
    }),
    description: new stills.descriptions.Captions(),
    content: new stills.content.Gif({
      timestamps: noTimestamps ? undefined : timestamps,
      duration: gifLength,
      width: gifWidth,
    }),
    caption: new stills.captions.Static({
      captions: config.captions,
      captionsFolder: resolve(PARENT_PROJECT_FOLDER, './captions/ddd'),
    }),
    taggers: [
      new stills.taggers.Episode(),
      new stills.taggers.Static({
        tags: ['guy fieri', 'guyfieri', 'diners drive-ins and dives'],
      }),
      new stills.taggers.Captions({
        url: MICROSOFT_COGNITIVE_URL,
        token: MICROSOFT_COGNITIVE_TOKEN,
      }),
    ],
    destinations: [new stills.destinations.Tumblr(TUMBLR_CONFIG)],
    filters: [new stills.filters.Reverse()],
    filterCaption: new stills.filters.captions.Simple({
      ...FONT_STYLES[FONT],
    }),
    onFrameChange: updateClient,
    onImageChange: updateClient,
    onSetup: updateClient,
    fastPreview: true, // gifWidth <= 540,
  });
};

const upload = multer({ dest: './.temp' });

instance = getInstance();

app.delete('/frame', async (req, res) => {
  const { index, frame } = req.query;
  await instance.deleteFrame(parseInt(index, 10), parseInt(frame, 10));
  updateClient();
  res.sendStatus(200);
});

app.post('/replace', upload.single('image'), async (req, res) => {
  const path = resolve(req.file.path);
  const { index, frame } = req.body;
  if (frame) {
    instance.replaceFrame(parseInt(index, 10), parseInt(frame, 10), path);
  } else {
    instance.replaceImage(parseInt(index, 10), path);
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
  const { video, seconds, timestamps, length, comment } = req.body;
  const bookmarks = existsSync(BOOKMARKS_FILE)
    ? JSON.parse(readFileSync(BOOKMARKS_FILE).toString())
    : [];

  const data = {
    video,
  };

  if (length) {
    data.length = parseFloat(length);
  }

  if (timestamps) {
    data.timestamps = timestamps;
  } else if (seconds) {
    data.seconds = parseFloat(seconds);
  }

  if (comment) {
    data.comment = comment;
  }

  bookmarks.push(data);
  writeFileSync(BOOKMARKS_FILE, JSON.stringify(bookmarks, null, 2));
  res.json(bookmarks);
});

app.get('/videos', async (req, res) => {
  files = sync(`*.mp4`, { cwd: VIDEOS_FOLDER }).map((f) => parse(f).name);
  res.json(files);
});

assets.get('/still/:imageNum/:frameNum.png', (req, res) => {
  const { imageNum, frameNum } = req.params;
  const image = instance.images[parseInt(imageNum, 10)];
  const frame = image.frames.frames[parseInt(frameNum, 10)];
  res.contentType('image/jpeg');
  res.end(frame.buffer, 'binary');
});

app.get('/reset', async (req, res) => {
  let {
    video,
    length,
    timestamps: ts,
    width,
    search: searchString,
    smart,
  } = req.query;
  let timestamps = ts.split(',').map((f) => parseFloat(f));

  if (existsSync(PROJECT_FILE)) {
    unlinkSync(PROJECT_FILE);
  }

  if (!video && searchString) {
    console.log('Grabbing an episode with search:', searchString);
    const results = await search(searchString);
    if (results.length > 0) {
      const result = results[Math.floor(Math.random() * results.length)];
      const {
        data: { name, seconds },
      } = result;
      video = name;
      timestamps = [seconds];
      console.log(result);
    }
  }

  await instance.delete();

  instance = getInstance({ video, timestamps, length, width });

  project = await setup(smart === 'true');
  updateClient();
  res.json(project);
});

app.get('/apply', async (req, res) => {
  instance.reset(true);
  await instance.applyFilters();
  res.sendStatus(200);
});

app.get('/collapse', async (req, res) => {
  await instance.collapse();
  res.sendStatus(200);
});

app.get('/post', async (req, res) => {
  await instance.generateMetaInfo();
  await instance.post();
  res.sendStatus(200);
});

app.post('/restart', (req, res) => {
  writeFileSync(RESTART_FILE, Date.now().toString());
  res.sendStatus(200);
});

const restore = async () => {
  project = JSON.parse(readFileSync(PROJECT_FILE).toString());
  console.log('Restoring project', project);
  await instance.restore(project, true);
};

const setup = async (isSmart = false) => {
  if (existsSync(PROJECT_FILE)) {
    return await restore();
  }
  const project = isSmart
    ? await instance.smartSetup()
    : await instance.setup();
  const cleanProject = {
    ...project,
    images: project.images.map((image) => ({ ...image, buffers: null })),
  };
  writeFileSync(PROJECT_FILE, JSON.stringify(cleanProject, null, 2));
  return project;
};

const watch = () => {
  watchFile(CONFIG_FILE, () => {
    console.log(`Config changed: ${Date.now()}`);
    onConfigChange();
  });
};

const onConfigChange = () => {
  const config = getConfig();
  const { captions } = config;
  project = JSON.parse(readFileSync(PROJECT_FILE).toString());
  project.captions = captions.map((c) => (Array.isArray(c) ? c : [c]));
  writeFileSync(PROJECT_FILE, JSON.stringify(project, null, 2));
  writeFileSync(RESTART_FILE, Date.now().toString());
  console.log(config);
};

io.on('connection', (socket) => {
  console.log('Connected!');
  io.emit('update', getProject());
  socket.on('disconnect', () => {
    console.log('Disconnected!');
  });
});

(async () => {
  await setup();
  await watch();

  app.use(express.static('dist'));
  assets.use('/image', express.static('static'));
  assets.use(express.static(VIDEOS_FOLDER));

  server.listen(PORT, () => {
    console.log(`App listening at http://localhost:${PORT}`);
  });

  assets.listen(ASSETS_PORT, () => {
    console.log(`Assets listening at http://localhost:${ASSETS_PORT}`);
  });
})();
