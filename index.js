require('dotenv').config();
require('./logo');

const argv = require('yargs')
  .usage('Usage: $0 <command> [options]')
  .default('type', 'random')
  .array('effects')
  .choices('type', ['still', 'gif', 'random'])
  .boolean('post')
  .describe('post', 'Upload image to the destinations')
  .describe('effects', 'Apply a specific GIF effect (by name)')
  .describe('local', 'Local folder to read videos from instead of S3')
  .describe('captionFileGlob', 'Use a particular caption glob')
  .describe('type', 'The type of image generated').argv;

const stills = require('stills');
const { resolve } = require('path');
const { compact, random, sample, sampleSize, get } = require('lodash');
const rp = require('request-promise');

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
  TWITTER_QUOTE_CONSUMER_KEY,
  TWITTER_QUOTE_CONSUMER_SECRET,
  TWITTER_QUOTE_ACCESS_TOKEN_KEY,
  TWITTER_QUOTE_ACCESS_TOKEN_SECRET,
  POST_TEXT_GENERATOR_URL,
  GIF_EFFECT_RATE
} = process.env;

const { local, effects, captionFileGlob } = argv;

const GIF_STILL_RATE = 0.5;
const CAPTION_RATE = captionFileGlob ? 1 : 0.8;
const USE_GIF_EFFECT_RATE = GIF_EFFECT_RATE ? parseFloat(GIF_EFFECT_RATE) : 0.2;

const randomly = (rate, hit = true, miss = false) =>
  Math.random() < rate ? hit : miss;

const source = local
  ? new stills.sources.Local({
      folder: local
    })
  : new stills.sources.S3({
      accessKeyId: S3_ACCESS_KEY_ID,
      secretAccessKey: S3_SECRET_ACCESS_KEY,
      bucket: S3_BUCKET
    });

const type =
  argv.type === 'random' ? randomly(GIF_STILL_RATE, 'gif', 'still') : argv.type;

const isGif = type === 'gif';

const content = isGif ? new stills.content.Gif() : new stills.content.Still();

const allEffects = [
  new stills.filters.FaceZoom({
    lastFrameDelayMs: 500,
    startPosition: 0.9
  }),
  new stills.filters.Distortion({
    heightFactor: random(0.4, 0.6)
  }),
  new stills.filters.Station(),
  new stills.filters.Shuffle(),
  new stills.filters.Stutter({
    numFrames: random(6, 16),
    stutterDelay: 0
  }),
  new stills.filters.Tint({
    factor: 1.7
  }),
  new stills.filters.Invert(),
  new stills.filters.Gray()
];

let useEffects = [];

if (isGif) {
  useEffects = effects
    ? allEffects.filter(e => effects.indexOf(e.name) !== -1)
    : randomly(USE_GIF_EFFECT_RATE, sampleSize(allEffects), []);
}

const filters = compact([
  ...useEffects,
  randomly(
    CAPTION_RATE,
    new stills.filters.Captions({
      captionFileGlob,
      folder: resolve('./captions'),
      font: resolve('./fonts/arial.ttf'),
      isSequential: true,
      num: {
        srt: random(1, 2),
        txt: 1
      }
    })
  )
]);

const destinations = argv.post
  ? [
      new stills.destinations.Tumblr({
        consumerKey: TUMBLR_CONSUMER_KEY,
        consumerSecret: TUMBLR_CONSUMER_SECRET,
        token: TUMBLR_ACCESS_TOKEN_KEY,
        tokenSecret: TUMBLR_ACCESS_TOKEN_SECRET,
        blogName: TUMBLR_BLOG_NAME,
        tags: ['Guy Fieri']
      }),
      new stills.destinations.Twitter({
        consumerKey: TWITTER_CONSUMER_KEY,
        consumerSecret: TWITTER_CONSUMER_SECRET,
        accessTokenKey: TWITTER_ACCESS_TOKEN_KEY,
        accessTokenSecret: TWITTER_ACCESS_TOKEN_SECRET
      })
    ]
  : [];

const getPostText = async captions => {
  if (!POST_TEXT_GENERATOR_URL) {
    return null;
  }
  console.log('\n🎁 Talking to Dreamscape');
  const input = captions
    .join(' ')
    .replace(/\\n/gi, ' ')
    .replace(/\s{2,}/, ' ');
  let output;
  try {
    const req = await rp({
      uri: POST_TEXT_GENERATOR_URL,
      qs: {
        q: input,
        length: 100
      },
      json: true
    });
    output = req.output;
    if (output) {
      const match = output.match(/[.!?]/gi);
      const lastIndex = output.lastIndexOf(match[match.length - 1]);
      output = output.slice(0, lastIndex + 1);
    }
  } catch (err) {
    console.log(`💥 Something borked: ${err}`);
  }

  return output;
};

(async function() {
  console.log(`🏃 Running in ${local ? 'local' : 'S3'} mode`);

  const mainConfig = {
    source,
    content,
    filters,
    destinations
  };

  const tumblrFictionConfig = async mainResult => {
    // This gives us all the info we need to reblog the main post
    const { blogName, postId, tags } = get(
      mainResult,
      'destinations.tumblr',
      {}
    );
    const { captions } = mainResult.filters;
    if (!blogName || !postId || !captions || captions.length === 0) {
      return;
    }
    // Use the caption from the main post to generate a story
    const postText = await getPostText(captions);
    return {
      image: mainResult.content,
      getPostText: () => postText,
      destinations: [
        new stills.destinations.Tumblr({
          // Just use the same tags as the main post
          tags,
          reblog: {
            blogName,
            postId
          },
          consumerKey: TUMBLR_CONSUMER_KEY,
          consumerSecret: TUMBLR_CONSUMER_SECRET,
          token: TUMBLR_ACCESS_TOKEN_KEY,
          tokenSecret: TUMBLR_ACCESS_TOKEN_SECRET,
          blogName: TUMBLR_REBLOG_BLOG_NAME
        })
      ]
    };
  };

  const twitterFictionConfig = async (tumblrFictionResult, [mainResult]) => {
    const { text } = get(tumblrFictionResult, 'destinations.tumblr', {});

    // We didn't post the main post to Twitter, so skip this one too.
    // Also skip if there is no story to post.
    if (!mainResult.destinations.twitter || !text) {
      return;
    }
    return {
      image: mainResult.content,
      getPostText: () => text,
      filters: [
        new stills.filters.Annotate({
          text,
          style: {
            color: 'white',
            padding: 150,
            bgColor: sample([
              '#231f20',
              '#a5311f',
              '#7a2417',
              '#a48752',
              '#42403d'
            ]),
            lineSpacing: 10,
            localFontPath: resolve('./fonts/legend.ttf'),
            localFontName: 'Legend',
            font: '50px Legend'
          }
        })
      ],
      destinations: [
        new stills.destinations.Twitter({
          consumerKey: TWITTER_QUOTE_CONSUMER_KEY,
          consumerSecret: TWITTER_QUOTE_CONSUMER_SECRET,
          accessTokenKey: TWITTER_QUOTE_ACCESS_TOKEN_KEY,
          accessTokenSecret: TWITTER_QUOTE_ACCESS_TOKEN_SECRET
        })
      ]
    };
  };

  const results = await stills.generateChain([
    mainConfig,
    tumblrFictionConfig,
    twitterFictionConfig
  ]);

  if (destinations.length) {
    stills.deleteStills(results);
  }
})();
