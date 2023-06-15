const stills = require('stills');
const Cormorants = require('cormorants');
const { sample } = require('lodash');

class CormorantsConfig {
  getOptions() {
    return {
      filterText: {
        description: 'Narrow down the questions',
        string: true,
      },
      verbose: {
        describe: 'Verbose mode',
        boolean: true,
        default: false,
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
    ALLOWED_WORDS,
    filterText,
    setQuestion,
    setAnswer,
    verbose,
  }) {
    this.cormants = new Cormorants({
      filterText,
      setQuestion,
      setAnswer,
      corpus: sample(CORMORANTS_CORPUS.split(',')),
      accessTokenKey: TUMBLR_ACCESS_TOKEN_KEY,
      accessTokenSecret: TUMBLR_ACCESS_TOKEN_SECRET,
      consumerKey: TUMBLR_CONSUMER_KEY,
      consumerSecret: TUMBLR_CONSUMER_SECRET,
      blogName: TUMBLR_BLOG_NAME,
      modelName: CORMORANTS_MODEL_NAME,
      moderation: new stills.moderation.Words({
        bannedWords: (BANNED_WORDS || '').split(','),
        allowedWords: (ALLOWED_WORDS || '').split(','),
      }),
      minWords: 4,
      isIncludeMedia: true,
      isVerbose: verbose,
    });
    const result = await this.cormants.speak();
    if (!result) {
      console.warn(`💀 There is nothing to post.`);
      process.exit(0);
    }
    const { ask, answer, images } = result;
    const filters = [];
    filters.push(new stills.filters.Haze());

    if (images && images.length > 0) {
      const { url } = sample(images);
      const isTransparent = stills.utils.isTransparent(url);
      const overlayOptions = isTransparent
        ? {
            overlayFile: url,
            gravity: 'southwest',
            sizePercentWidth: 0.3,
            geometry: '+20%',
          }
        : {
            isGrayscale: true,
            overlayFile: url,
            opacity: 20,
          };
      filters.push(new stills.filters.Overlay(overlayOptions));
    }

    return {
      ask,
      filters,
      type: 'gif',
      num: 1,
      validators: [new stills.validators.EyeDetection()],
      caption: new stills.captions.Static({
        captions: [answer],
      }),
    };
  }
}

module.exports = CormorantsConfig;
