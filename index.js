require('dotenv').config();
require('./logo');

const yargs = require('yargs');
const stills = require('stills');
const { compact, flatten, get } = require('lodash');
const FieriFiction = require('fierifiction');

const configs = {
  default: require('./configs/default'),
  clean: require('./configs/clean'),
  arcadia: require('./configs/arcadia'),
  dreamers: require('./configs/dreamers'),
  celestial: require('./configs/celestial'),
  cormorants: require('./configs/cormorants'),
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
  descriptionText: {
    describe: 'Description text to use',
  },
  config: {
    describe: 'What config template to use',
    choices: Object.keys(configs),
    default: 'default',
  },
};

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
  options.sourceSeconds = options.sourceSeconds
    ? getSourceSeconds(options.sourceSeconds)
    : null;

  const baseConfig = await useConfig.generateConfig(options);
  const {
    type,
    num,
    tags,
    highlightColor,
    isCreateFiction,
    blogName,
    isDraft,
    ask,
    validators,
  } = baseConfig;

  const {
    post,
    prompt,
    local,
    sourceFilter,
    sourceLength,
    sourceSeconds,
    outputFolder,
    secondsApart,
    gifWidth,
    draft,
    descriptionText,
    TUMBLR_CONSUMER_KEY,
    TUMBLR_CONSUMER_SECRET,
    TUMBLR_ACCESS_TOKEN_KEY,
    TUMBLR_ACCESS_TOKEN_SECRET,
    TUMBLR_BLOG_NAME,
    TUMBLR_REBLOG_BLOG_NAME,
    S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY,
    S3_BUCKET,
    GIF_FPS,
    GIF_LENGTH_SECONDS,
    MICROSOFT_AZURE_TOKEN,
    GOOGLE_CLOUD_CREDENTIALS_BASE64,
    POST_TEXT_GENERATOR_URL,
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET,
  } = options;

  const NUM_GIF_LENGTH_SECONDS = GIF_LENGTH_SECONDS
    ? parseFloat(GIF_LENGTH_SECONDS)
    : 2;
  const NUM_GIF_FPS = GIF_FPS ? parseInt(GIF_FPS) : 12;
  const postDraft = draft || isDraft;
  const postBlogName = blogName || TUMBLR_BLOG_NAME;

  const TUMBLR_CONFIG = {
    highlightColor,
    ask,
    consumerKey: TUMBLR_CONSUMER_KEY,
    consumerSecret: TUMBLR_CONSUMER_SECRET,
    token: TUMBLR_ACCESS_TOKEN_KEY,
    tokenSecret: TUMBLR_ACCESS_TOKEN_SECRET,
    blogName: postBlogName,
    publishState: postDraft ? 'draft' : undefined,
  };

  const destinations = post
    ? [new stills.destinations.Tumblr(TUMBLR_CONFIG)]
    : [];

  const source = local
    ? new stills.sources.Local({
        folder: local,
        filter: sourceFilter
          ? (file) => file.indexOf(sourceFilter) !== -1
          : null,
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
      blink: 'tw:flashing',
      arcadia: 'et in arcadia ego',
    }),
    new stills.taggers.Analysis(),
  ];

  const description = descriptionText
    ? new stills.descriptions.Static({ description: descriptionText })
    : new stills.descriptions.Captions();
  const analysis =
    destinations.length > 0 && MICROSOFT_AZURE_TOKEN
      ? new stills.analysis.Azure({
          token: MICROSOFT_AZURE_TOKEN,
          minCaptionConfidence: 0.1,
        })
      : null;

  const contents = {
    gif: new stills.content.Gif({
      secondsApart,
      width: gifWidth,
      seconds: sourceSeconds,
      duration: Number.isFinite(sourceLength)
        ? sourceLength
        : NUM_GIF_LENGTH_SECONDS,
      fps: NUM_GIF_FPS,
    }),
    still: new stills.content.Still({
      secondsApart,
      seconds: sourceSeconds,
    }),
  };

  const content = contents[type];
  const baseConfigData = baseConfig.data || {};

  const finalConfig = {
    ...baseConfig,
    num,
    analysis,
    destinations,
    description,
    taggers,
    source,
    content,
    validators,
    isPrompt: prompt,
  };

  console.log(`🏃 Running in ${local ? 'local' : 'S3'} mode`);
  console.log(
    `📮 ${destinations.length > 0 ? 'Posting' : 'Not posting'}${
      postDraft ? ' draft' : ''
    } to ${postBlogName}`
  );

  const result = await stills.generate(finalConfig);

  if (useConfig.onComplete) {
    await useConfig.onComplete(result, baseConfigData);
  }

  if (isCreateFiction && result.destinations && result.destinations.tumblr) {
    let captions = flatten(get(result, 'captions', []));
    const { text } = result.destinations.tumblr;
    // Bad workaround for passthroughs currently not populating globals
    if (captions.length === 0 && text) {
      captions = Array.from(text.matchAll(/Caption: (.*)]/g)).map((m) => m[1]);
    }
    if (captions.length > 0) {
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
        spotifyClientId: SPOTIFY_CLIENT_ID,
        spotifyClientSecret: SPOTIFY_CLIENT_SECRET,
      });

      await fierifiction.postVideo(
        result.content,
        captions,
        result.tags,
        result.destinations.tumblr.url,
        postDraft ? 'draft' : undefined
      );
    }
  }

  if (destinations.length > 0) {
    stills.deleteStills(result);
  }

  process.exit(0);
})();
