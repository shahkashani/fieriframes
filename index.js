require('dotenv').config();
require('./logo');

const argv = require('yargs')
  .usage('Usage: $0 <command> [options]')
  .default('type', 'random')
  .choices('type', ['still', 'gif', 'random'])
  .boolean('post')
  .describe('post', 'Upload image to the destinations')
  .describe('local', 'Local folder to read videos from instead of S3')
  .describe('type', 'The type of image generated').argv;

const stills = require('stills');
const { resolve } = require('path');

const {
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
  S3_BUCKET,
  TUMBLR_CONSUMER_KEY,
  TUMBLR_CONSUMER_SECRET,
  TUMBLR_ACCESS_TOKEN_KEY,
  TUMBLR_ACCESS_TOKEN_SECRET,
  TUMBLR_BLOG_NAME,
  TWITTER_CONSUMER_KEY,
  TWITTER_CONSUMER_SECRET,
  TWITTER_ACCESS_TOKEN_KEY,
  TWITTER_ACCESS_TOKEN_SECRET
} = process.env;

const GIF_VS_STILL_RATIO = 0.5;
const FIERI_VS_WHATEVER_RATIO = 0;
const { local } = argv;

const source = local
  ? new stills.sources.Local({
      folder: local
    })
  : new stills.sources.S3({
      accessKeyId: S3_ACCESS_KEY_ID,
      secretAccessKey: S3_SECRET_ACCESS_KEY,
      bucket: S3_BUCKET
    });

const content =
  argv.type === 'gif' ||
  (argv.type === 'random' && Math.random() < GIF_VS_STILL_RATIO)
    ? new stills.content.Gif()
    : new stills.content.Still();

const filters = [
  new stills.filters.Captions({
    folder: resolve('./captions'),
    font: resolve('./fonts/tex.otf'),
    isSequential: true
  })
];

const validators =
  Math.random() < FIERI_VS_WHATEVER_RATIO
    ? [
        new stills.validators.FaceRecognition({
          folder: resolve('./faces')
        })
      ]
    : [];

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

console.log(`🏃 Running in ${local ? 'local' : 'S3'} mode`);

stills.generate({
  source,
  content,
  filters,
  destinations,
  validators
});
