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

const GIF_STILL_RATE = 0.5;
const CAPTION_RATE = 0.8;
const USE_GIF_EFFECT_RATE = GIF_EFFECT_RATE ? parseFloat(GIF_EFFECT_RATE) : 0.2;

const { local, effects } = argv;

const randomly = (rate, hit = true, miss = false) =>
  Math.random() < rate ? hit : miss;

const post = async () => {
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
    argv.type === 'random'
      ? randomly(GIF_STILL_RATE, 'gif', 'still')
      : argv.type;

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
    })
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
        folder: resolve('./captions'),
        font: resolve('./fonts/arial.ttf'),
        isSequential: true,
        num: random(1, 2)
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

  return stills.generate({
    source,
    content,
    filters,
    destinations,
    deleteAfterPosting: false
  });
};

const getPostText = async captions => {
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

const postTumblrFiction = async (result, text) => {
  const { blogName, postId } = get(result, 'destinations.tumblr', {});
  if (!blogName || !postId) {
    return;
  }
  return await stills.generate({
    image: result.content,
    deleteAfterPosting: false,
    getPostText: () => text,
    destinations: [
      new stills.destinations.Tumblr({
        consumerKey: TUMBLR_CONSUMER_KEY,
        consumerSecret: TUMBLR_CONSUMER_SECRET,
        token: TUMBLR_ACCESS_TOKEN_KEY,
        tokenSecret: TUMBLR_ACCESS_TOKEN_SECRET,
        blogName: TUMBLR_REBLOG_BLOG_NAME,
        tags: result.destinations.tumblr.tags,
        reblog: {
          blogName,
          postId
        }
      })
    ]
  });
};

const postTwitterFiction = async (result, text) => {
  return await stills.generate({
    image: result.content,
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
  });
};

(async function() {
  console.log(`🏃 Running in ${local ? 'local' : 'S3'} mode`);

  const result = await post();
  const { destinations: postedDestinations, filters: postedFilters } = result;

  if (
    Object.keys(postedDestinations || {}).length > 0 &&
    get(postedFilters, 'captions', []).length > 0 &&
    POST_TEXT_GENERATOR_URL
  ) {
    const postText = await getPostText(postedFilters.captions);
    await postTumblrFiction(result, postText);
    await postTwitterFiction(result, postText);
  }
})();
