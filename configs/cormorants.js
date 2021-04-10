const stills = require('stills');
const Cormorants = require('cormorants');
const pdf = require('pdf-parse');
const { readFileSync } = require('fs');

class CormorantsConfig {
  async generateConfig({
    TUMBLR_ACCESS_TOKEN_KEY,
    TUMBLR_ACCESS_TOKEN_SECRET,
    TUMBLR_CONSUMER_KEY,
    TUMBLR_CONSUMER_SECRET,
    TUMBLR_BLOG_NAME,
    CORMORANTS_CORPUS,
    BANNED_WORDS,
  }) {
    const string = readFileSync(CORMORANTS_CORPUS);
    const { text: corpus } = await pdf(string);

    this.cormants = new Cormorants({
      corpus,
      accessTokenKey: TUMBLR_ACCESS_TOKEN_KEY,
      accessTokenSecret: TUMBLR_ACCESS_TOKEN_SECRET,
      consumerKey: TUMBLR_CONSUMER_KEY,
      consumerSecret: TUMBLR_CONSUMER_SECRET,
      blogName: TUMBLR_BLOG_NAME,
      bannedWords: (BANNED_WORDS || '').split(','),
    });
    const result = await this.cormants.speak();
    if (!result) {
      console.warn(`💀 There is nothing to post.`);
      process.exit(0);
    }
    const { ask, answer } = result;

    return {
      ask,
      type: 'gif',
      num: 1,
      globals: [
        new stills.globals.Captions({
          captionText: [answer],
        }),
      ],
      filters: [new stills.filters.Haze(), new stills.filters.Captions()],
    };
  }
}

module.exports = CormorantsConfig;
