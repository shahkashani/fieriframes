require('dotenv').config();
require('./logo');

const yargs = require('yargs');
const stills = require('stills');
const { compact, flatten, get } = require('lodash');
const { copyFileSync } = require('fs');
const FieriFiction = require('fierifiction');

const configs = {
  default: require('./configs/default'),
  clean: require('./configs/clean'),
  arcadia: require('./configs/arcadia'),
  dreamers: require('./configs/dreamers'),
};

const DEFAULT_OPTIONS = {
  sourceSeconds: {
    describe: 'Where in the video to start creating the images from',
  },
  post: {
    describe: 'Post the generates images to the destination',
    boolean: true,
  },
  draft: {
    describe: 'Create as draft',
    boolean: true,
  },
  prompt: {
    describe: 'Prompt before posting',
    boolean: true,
    default: false,
  },
  local: {
    describe: 'Local folder to read videos from',
  },
  sourceFilter: {
    describe: 'A glob for what video file to pick stills from',
  },
  sourceLength: {
    describe: 'How long GIFs should be',
    number: true,
  },
  secondsApart: {
    describe: 'How far multiple images should be separated apart',
    number: true,
  },
  outputFolder: {
    describe: 'Where to put the generated images',
  },
  gifWidth: {
    describe: 'Width of GIFs',
    default: 720,
  },
  config: {
    describe: 'What config template to use',
    choices: Object.keys(configs),
    default: 'default',
  },
  images: {
    describe: 'Existing files to use',
    array: true,
    alias: 'i',
  },
};

(async () => {
  const { config } = yargs.options(DEFAULT_OPTIONS).help(false).argv;
  const useConfig = new configs[config]();
  const configOptions = useConfig.getOptions ? useConfig.getOptions() : {};

  const args = yargs
    .options({
      ...DEFAULT_OPTIONS,
      ...configOptions,
    })
    .help(true).argv;

  const options = { ...args, ...process.env };

  const baseConfig = await useConfig.generateConfig(options);
  const { type, num, tags, highlightColor } = baseConfig;

  const {
    post,
    prompt,
    local,
    images,
    sourceFilter,
    outputFolder,
    secondsApart,
    sourceLength,
    gifWidth,
    draft,
    sourceSeconds,
    TUMBLR_CONSUMER_KEY,
    TUMBLR_CONSUMER_SECRET,
    TUMBLR_ACCESS_TOKEN_KEY,
    TUMBLR_ACCESS_TOKEN_SECRET,
    TUMBLR_BLOG_NAME,
    TUMBLR_REBLOG_BLOG_NAME,
    FIERIFICTION_VIDEO_RATE,
    S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY,
    S3_BUCKET,
    GIF_FPS,
    GIF_LENGTH_SECONDS,
    MICROSOFT_AZURE_TOKEN,
    GOOGLE_CLOUD_CREDENTIALS_BASE64,
    POST_TEXT_GENERATOR_URL,
  } = options;

  const NUM_GIF_LENGTH_SECONDS = GIF_LENGTH_SECONDS
    ? parseFloat(GIF_LENGTH_SECONDS)
    : 2;
  const NUM_GIF_FPS = GIF_FPS ? parseInt(GIF_FPS) : 12;
  const NUM_FIERIFICTION_VIDEO_RATE = FIERIFICTION_VIDEO_RATE
    ? parseFloat(FIERIFICTION_VIDEO_RATE)
    : 0;

  const getSourceSeconds = (string) => {
    if (!string) {
      return undefined;
    }
    if (string.toString().indexOf(':') !== -1) {
      const [m, s] = string.split(':');
      return parseFloat(m) * 60 + parseFloat(s);
    }
    return parseFloat(string);
  };

  const useSourceSeconds = getSourceSeconds(sourceSeconds);

  const TUMBLR_CONFIG = {
    highlightColor,
    consumerKey: TUMBLR_CONSUMER_KEY,
    consumerSecret: TUMBLR_CONSUMER_SECRET,
    token: TUMBLR_ACCESS_TOKEN_KEY,
    tokenSecret: TUMBLR_ACCESS_TOKEN_SECRET,
    blogName: TUMBLR_BLOG_NAME,
    publishState: draft ? 'draft' : undefined,
  };

  const destinations = post
    ? [new stills.destinations.Tumblr(TUMBLR_CONFIG)]
    : [];

  const source = local
    ? new stills.sources.Local({
        folder: local,
        filter: sourceFilter,
        outputFolder,
      })
    : new stills.sources.S3({
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_ACCESS_KEY,
        bucket: S3_BUCKET,
        filter: (file) =>
          !sourceFilter ? true : file.Key.indexOf(sourceFilter) !== -1,
      });

  const taggers = [
    new stills.taggers.Episode(),
    new stills.taggers.Static({
      tags: compact([
        'guy fieri',
        'guyfieri',
        'diners drive-ins and dives',
        ...(tags || []),
      ]),
    }),
    new stills.taggers.Captions(),
    new stills.taggers.Filters({
      shuffle: 'tw:flashing',
      stutter: 'tw:flashing',
      jitter: 'tw:flashing',
      flash: 'tw:flashing',
      tile: 'tw:flashing',
      fewframes: 'tw:flashing',
      repeatframe: 'tw:flashing',
      arcadia: 'et in arcadia ego',
    }),
    new stills.taggers.Azure(),
  ];

  const description = new stills.descriptions.Azure();
  const globalsAzure =
    destinations.length > 0 && MICROSOFT_AZURE_TOKEN
      ? new stills.globals.Azure({
          token: MICROSOFT_AZURE_TOKEN,
        })
      : null;

  const contents = {
    gif: new stills.content.Gif({
      secondsApart,
      num,
      width: gifWidth,
      seconds: useSourceSeconds,
      duration: Number.isFinite(sourceLength)
        ? sourceLength
        : NUM_GIF_LENGTH_SECONDS,
      fps: NUM_GIF_FPS,
      genOptions:
        'split [a][b];[a] palettegen=reserve_transparent=off:stats_mode=full [p];[b][p] paletteuse=1',
    }),
    still: new stills.content.Still({
      num,
      secondsApart,
      seconds: useSourceSeconds,
    }),
  };

  const content = contents[type];
  const baseConfigGlobals = baseConfig.globals || [];
  const baseConfigData = baseConfig.data || {};
  const globals = compact([...baseConfigGlobals, globalsAzure]);
  let useImages;

  if (images) {
    useImages = [];
    images.forEach((image) => {
      const output =
        image.indexOf('s.') !== -1
          ? image.replace(/s\./, 's-edited.')
          : `edited-${image}`;
      copyFileSync(image, output);
      useImages.push(output);
    });
  }

  const finalConfig = {
    ...baseConfig,
    globals,
    destinations,
    description,
    taggers,
    source,
    content,
    images: useImages,
    isPrompt: prompt,
  };

  console.log(`🏃 Running in ${local ? 'local' : 'S3'} mode`);
  const result = await stills.generate(finalConfig);

  if (useConfig.onComplete) {
    await useConfig.onComplete(result, baseConfigData);
  }

  const captions = flatten(get(result, 'globals.captions', []));

  if (
    Math.random() < NUM_FIERIFICTION_VIDEO_RATE &&
    captions.length > 0 &&
    result.destinations &&
    result.destinations.tumblr
  ) {
    const googleCloudCredentials = Buffer.from(
      GOOGLE_CLOUD_CREDENTIALS_BASE64,
      'base64'
    ).toString();

    const fierifiction = new FieriFiction({
      googleCloudCredentials,
      tumblrConsumerKey: TUMBLR_CONSUMER_KEY,
      tumblrConsumerSecret: TUMBLR_CONSUMER_SECRET,
      tumblrTokenKey: TUMBLR_ACCESS_TOKEN_KEY,
      tumblrTokenSecret: TUMBLR_ACCESS_TOKEN_SECRET,
      tumblrBlogName: TUMBLR_REBLOG_BLOG_NAME,
      textGeneratorUrl: POST_TEXT_GENERATOR_URL,
    });

    await fierifiction.postVideo(
      result.content,
      captions,
      result.tags,
      result.destinations.tumblr.url
    );
  }

  if (destinations.length > 0) {
    stills.deleteStills(result);
  }
})();
