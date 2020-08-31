require('dotenv').config();
require('./logo');

const argv = require('yargs')
  .usage('Usage: $0 <command> [options]')
  .default('type', 'random')
  .array('effects')
  .array('baseEffects')
  .array('tags')
  .array('captionText')
  .choices('type', ['still', 'gif', 'random'])
  .boolean('post')
  .boolean('face')
  .boolean('prompt')
  .number('sourceSeconds')
  .number('sourceLength')
  .number('num')
  .number('secondsApart')
  .number('ftopk')
  .number('ftemp')
  .number('flength')
  .number('captionStart')
  .number('captionEnd')
  .describe('num', 'The number of images to create')
  .describe('secondsApart', 'The number of seconds apart each image (see num)')
  .describe('post', 'Upload image to the destinations')
  .describe('prompt', 'Prompt before posting')
  .describe('effects', 'Apply a specific effect (by name)')
  .describe(
    'baseEffects',
    'Apply a specific effect (by name) and pick more at random'
  )
  .describe('local', 'Local folder to read videos from instead of S3')
  .describe('caption', 'Use a particular caption glob')
  .describe(
    'captionStart',
    'Use a particular starting point in % of caption file'
  )
  .describe('captionEnd', 'Use a particular end point in % of caption file')
  .describe('background', 'Background color for captions')
  .describe('outputFolder', 'Output folder')
  .describe('sourceFilter', 'A pattern to match source videos against')
  .describe('sourceLength', 'Clip length')
  .describe('sourceSeconds', 'Where in the source to pull the GIF/still from')
  .describe('blend', 'What blend file to use')
  .describe('fmusic', 'Fierifiction music glob')
  .describe('ftopk', 'Fierifiction topK')
  .describe('ftemp', 'Fierifiction temperature')
  .describe('flength', 'Fierifiction text length')
  .describe('tags', 'Extra tags to add')
  .describe('captionText', 'Exact caption text')
  .default('fmusic', '*.mp3')
  .default('ftopk', 40)
  .default('ftemp', 1)
  .default('flength', 100)
  .default('blend', '*.mp4')
  .default('secondsApart', 3)
  .describe('type', 'The type of image generated').argv;

const stills = require('stills');
const { resolve } = require('path');
const { sync } = require('glob');
const {
  compact,
  random,
  sampleSize,
  get,
  intersection,
  sample,
  map,
} = require('lodash');

const FieriFiction = require('fierifiction');

const {
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
  S3_BUCKET,
  TUMBLR_CONSUMER_KEY,
  TUMBLR_CONSUMER_SECRET,
  TUMBLR_ACCESS_TOKEN_KEY,
  TUMBLR_ACCESS_TOKEN_SECRET,
  TUMBLR_BLOG_NAME,
  TUMBLR_REBLOG_BLOG_NAME,
  TWITTER_CONSUMER_KEY,
  TWITTER_CONSUMER_SECRET,
  TWITTER_ACCESS_TOKEN_KEY,
  TWITTER_ACCESS_TOKEN_SECRET,
  POST_TEXT_GENERATOR_URL,
  GIF_EFFECT_RATE,
  CAPTION_EFFECT_RATE,
  CAPTION_NAME_REPLACER_RATE,
  FIERIFICTION_VIDEO_RATE,
  GOOGLE_CLOUD_CREDENTIALS_BASE64,
  GIF_LENGTH_SECONDS,
  GIF_FPS,
  MICROSOFT_AZURE_TOKEN,
  MAX_NUM_EFFECTS,
} = process.env;

const {
  local,
  effects,
  caption,
  sourceFilter,
  background,
  face,
  outputFolder,
  userName,
  prompt: isPrompt,
  blend,
  fmusic,
  ftopk,
  flength,
  ftemp,
  tags: addTag,
  captionStart,
  captionEnd,
  sourceSeconds,
  sourceLength,
  captionText,
  baseEffects,
  num,
  secondsApart,
} = argv;

(async function () {
  const maxNumEffects = MAX_NUM_EFFECTS ? parseInt(MAX_NUM_EFFECTS, 10) : 1;
  const GIF_STILL_RATE = 0.5;
  const CAPTION_RATE =
    caption || (captionText && captionText.length > 0) ? 1 : 0.9;
  const USE_GIF_EFFECT_RATE = GIF_EFFECT_RATE
    ? parseFloat(GIF_EFFECT_RATE)
    : 0.2;
  const USE_CAPTION_EFFECT_RATE = CAPTION_EFFECT_RATE
    ? parseFloat(CAPTION_EFFECT_RATE)
    : 0;
  const USE_CAPTION_NAME_REPLACER_RATE = CAPTION_NAME_REPLACER_RATE
    ? parseFloat(CAPTION_NAME_REPLACER_RATE)
    : 0;
  const NUM_FIERIFICTION_VIDEO_RATE = FIERIFICTION_VIDEO_RATE
    ? parseFloat(FIERIFICTION_VIDEO_RATE)
    : 0.5;
  const NUM_GIF_LENGTH_SECONDS = GIF_LENGTH_SECONDS
    ? parseFloat(GIF_LENGTH_SECONDS)
    : 2;
  const NUM_GIF_FPS = GIF_FPS ? parseInt(GIF_FPS) : 12;

  const fiction = new FieriFiction({
    tumblrConsumerKey: TUMBLR_CONSUMER_KEY,
    tumblrConsumerSecret: TUMBLR_CONSUMER_SECRET,
    tumblrTokenKey: TUMBLR_ACCESS_TOKEN_KEY,
    tumblrTokenSecret: TUMBLR_ACCESS_TOKEN_SECRET,
    tumblrBlogName: TUMBLR_REBLOG_BLOG_NAME,
    googleCloudCredentials: Buffer.from(
      GOOGLE_CLOUD_CREDENTIALS_BASE64,
      'base64'
    ).toString(),
    textGeneratorUrl: POST_TEXT_GENERATOR_URL,
    topK: ftopk,
    temperature: ftemp,
    music: fmusic,
    textLength: flength,
  });

  const randomly = (rate, hit = true, miss = false) =>
    Math.random() < rate ? hit : miss;

  const getEffectsByName = (allEffects, effects) => {
    const allEffectsNames = map(allEffects, 'name');

    return effects.reduce(
      (memo, name) =>
        allEffectsNames.indexOf(name) !== -1
          ? [...memo, allEffects[allEffectsNames.indexOf(name)]]
          : memo,
      []
    );
  };

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

  const type =
    argv.type === 'random'
      ? randomly(GIF_STILL_RATE, 'gif', 'still')
      : argv.type;

  const isGif = type === 'gif';

  const content = isGif
    ? new stills.content.Gif({
        secondsApart,
        duration: Number.isFinite(sourceLength)
          ? sourceLength
          : NUM_GIF_LENGTH_SECONDS,
        seconds: sourceSeconds,
        fps: NUM_GIF_FPS,
        num: Number.isFinite(num) ? num : 1,
      })
    : new stills.content.Still({
        num: Number.isFinite(num) ? num : randomly(0.5, 3, 1),
        secondsApart,
        seconds: sourceSeconds,
      });

  const avoidDescriptors = [resolve('./faces/guy-fieri.json')];

  const orbs = [
    {
      radius: 0.4,
      blur: 0.4,
      color: '#e60000',
    },
    {
      radius: 0.1,
      blur: 0.3,
      color: 'white',
    },
  ];

  const blendFiles = sync(`./blend/${blend}`);

  const gifEffects = [
    new stills.filters.Distortion({
      heightFactor: random(0.4, 0.6),
    }),
    new stills.filters.Shuffle({
      delay: '2x30',
    }),
    new stills.filters.Stutter({
      numFrames: random(6, 16),
      stutterDelay: 0,
    }),
    new stills.filters.Tint({
      factor: 1.7,
    }),
    new stills.filters.Invert(),
    new stills.filters.Gray(),
    new stills.filters.Reverse(),
    new stills.filters.Implode(),
    new stills.filters.Swirl(),
    new stills.filters.Rotate({
      useProgress: false,
      degrees: 15,
    }),
    new stills.filters.Flip(),
    new stills.filters.Flop(),
    new stills.filters.Jitter(),
    new stills.filters.FaceOrb({ orbs }),
    new stills.filters.FaceStretch({
      useProgress: true,
      randomOffset: 0,
    }),
    new stills.filters.FaceDemonEyes({
      avoidDescriptors,
    }),
    new stills.filters.FaceDemonize({
      avoidDescriptors,
    }),
    new stills.filters.FacePinch({
      avoidDescriptors,
    }),
    new stills.filters.FaceGlow({
      avoidDescriptors,
      blur: 0.1,
    }),
    new stills.filters.Tempo(),
    new stills.filters.FewFrames(),
    new stills.filters.Liquify(),
    new stills.filters.Pip(),
    new stills.filters.Flash(),
    new stills.filters.Station(),
    new stills.filters.Tile({
      numTiles: 4,
    }),
    new stills.filters.BlendSelf(),
    new stills.filters.Blend({
      opacity: 0.5,
      overlayFile: sample(blendFiles),
    }),
    new stills.filters.Mirror(),
  ];

  const stillEffects = [
    new stills.filters.FaceOrb({ orbs }),
    new stills.filters.FaceStretch(),
    new stills.filters.FaceDemonEyes({
      avoidDescriptors,
    }),
    new stills.filters.FacePinch({
      avoidDescriptors,
    }),
    new stills.filters.FaceGlow({
      avoidDescriptors,
      blur: 0.1,
    }),
    new stills.filters.FaceDemonize({
      avoidDescriptors,
    }),
    new stills.filters.Liquify(),
    new stills.filters.Colorize(),
    new stills.filters.Mirror(),
  ];

  let allEffects = isGif ? gifEffects : stillEffects;

  let useEffects = effects
    ? getEffectsByName(allEffects, effects)
    : randomly(
        USE_GIF_EFFECT_RATE,
        sampleSize(allEffects, random(1, maxNumEffects)),
        []
      );

  let useBaseEffects = baseEffects
    ? getEffectsByName(allEffects, baseEffects)
    : [];

  const filters = compact([
    ...useEffects,
    ...useBaseEffects,
    new stills.filters.Captions({
      background,
      folder: resolve('./captions'),
      font: resolve('./fonts/arial.ttf'),
      glyphs: false,
    }),
  ]);

  const tumblrCreds = {
    consumerKey: TUMBLR_CONSUMER_KEY,
    consumerSecret: TUMBLR_CONSUMER_SECRET,
    token: TUMBLR_ACCESS_TOKEN_KEY,
    tokenSecret: TUMBLR_ACCESS_TOKEN_SECRET,
    blogName: TUMBLR_BLOG_NAME,
  };

  const twitterCreds = {
    consumerKey: TWITTER_CONSUMER_KEY,
    consumerSecret: TWITTER_CONSUMER_SECRET,
    accessTokenKey: TWITTER_ACCESS_TOKEN_KEY,
    accessTokenSecret: TWITTER_ACCESS_TOKEN_SECRET,
  };

  const destinations = argv.post
    ? [
        new stills.destinations.Tumblr(tumblrCreds),
        new stills.destinations.Twitter(twitterCreds),
      ]
    : [];

  const taggers = [
    new stills.taggers.Episode(),
    new stills.taggers.Static({
      tags: compact([
        'guy fieri',
        'guyfieri',
        'diners drive-ins and dives',
        ...(addTag || []),
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
    }),
    new stills.taggers.Azure(),
  ];

  const description = new stills.descriptions.Azure();

  const validators = face ? [new stills.validators.FaceDetection()] : [];

  const singleCaptionEffects = ['fewframes', 'tempo', 'jitter'];

  const useSingleCaption =
    (Number.isFinite(num) && num > 1) ||
    intersection(singleCaptionEffects, map(useEffects, 'name')).length > 0;

  const captionTransforms = randomly(
    USE_CAPTION_EFFECT_RATE,
    sampleSize(['uppercase', 'music', 'exclamation'], 1),
    []
  );

  const globalsCaption = randomly(
    CAPTION_RATE,
    new stills.globals.Captions({
      captionFileGlob: caption ? `*${caption}*` : undefined,
      folder: resolve('./captions'),
      captionStart,
      captionEnd,
      captionText,
      pdfSentenceMaxLength: 50,
      transformations: captionTransforms,
      num: {
        srt: useSingleCaption ? 1 : random(1, 2),
        txt: 1,
        pdf: useSingleCaption ? 1 : random(1, 2),
      },
    })
  );

  const globalsAzure = MICROSOFT_AZURE_TOKEN
    ? new stills.globals.Azure({
        token: MICROSOFT_AZURE_TOKEN,
      })
    : null;

  const userPlugin = new stills.globals.User({
    ...tumblrCreds,
    userName,
    mentionsSymbol: '@',
  });

  const globalsRandomUser = userName
    ? userPlugin
    : randomly(USE_CAPTION_NAME_REPLACER_RATE, userPlugin);

  const globals = compact([globalsRandomUser, globalsAzure, globalsCaption]);

  console.log(`🏃 Running in ${local ? 'local' : 'S3'} mode`);

  const result = await stills.generate({
    source,
    content,
    filters,
    destinations,
    taggers,
    validators,
    description,
    globals,
    isPrompt,
  });

  const output = result.content;

  const captions = get(result, 'globals.captions', []);
  const tags = get(result, 'tags', []);
  const tumblr = get(result, 'destinations.tumblr');

  if (destinations.length) {
    /*
    if (captions.length) {
      const generator = randomly(
        NUM_FIERIFICTION_VIDEO_RATE,
        async () => {
          await fiction.postVideo(output, captions, tags, tumblr.url, {
            postId: tumblr.postId,
            blogName: tumblr.blogName,
          });
        },
        async () => {
          await fiction.postText(
            captions,
            tumblr.postId,
            tumblr.blogName,
            tags
          );
        }
      );
      await generator();
    }
    */
    stills.deleteStills(result);
  }
})();
