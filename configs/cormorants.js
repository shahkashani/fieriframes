const stills = require('stills');
const Cormorants = require('cormorants');
const { sample } = require('lodash');

class CormorantsConfig {
  getOptions() {
    return {
      filterText: {
        description: 'Narrow down the questions',
      },
    };
  }
  async generateConfig({
    TUMBLR_ACCESS_TOKEN_KEY,
    TUMBLR_ACCESS_TOKEN_SECRET,
    TUMBLR_CONSUMER_KEY,
    TUMBLR_CONSUMER_SECRET,
    TUMBLR_BLOG_NAME,
    CORMORANTS_CORPUS,
    CORMORANTS_MODEL_NAME,
    BANNED_WORDS,
    filterText,
  }) {
    this.cormants = new Cormorants({
      filterText,
      corpus: sample(CORMORANTS_CORPUS.split(',')),
      accessTokenKey: TUMBLR_ACCESS_TOKEN_KEY,
      accessTokenSecret: TUMBLR_ACCESS_TOKEN_SECRET,
      consumerKey: TUMBLR_CONSUMER_KEY,
      consumerSecret: TUMBLR_CONSUMER_SECRET,
      blogName: TUMBLR_BLOG_NAME,
      modelName: CORMORANTS_MODEL_NAME,
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
