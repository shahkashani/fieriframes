const stills = require('stills');
const Cormorants = require('cormorants');

class CormorantsConfig {
  constructor() {}

  async generateConfig({
    TUMBLR_ACCESS_TOKEN_KEY,
    TUMBLR_ACCESS_TOKEN_SECRET,
    TUMBLR_CONSUMER_KEY,
    TUMBLR_CONSUMER_SECRET,
    TUMBLR_BLOG_NAME,
  }) {
    const cormorants = new Cormorants({
      tumblrConfig: {
        consumerKey: TUMBLR_CONSUMER_KEY,
        consumerSecret: TUMBLR_CONSUMER_SECRET,
        accessTokenKey: TUMBLR_ACCESS_TOKEN_KEY,
        accessTokenSecret: TUMBLR_ACCESS_TOKEN_SECRET,
        blogName: TUMBLR_BLOG_NAME,
      },
    });
    const post = await cormorants.getNextAsk();
    if (!post) {
      console.info(`💀 There is nothing to answer.`);
      process.exit(0);
    }
    const { ask, captions } = post;
    return {
      ask,
      type: 'gif',
      num: captions.length,
      caption: new stills.captions.StaticMatch({
        captions,
      }),
    };
  }
}

module.exports = CormorantsConfig;
