const stills = require('stills');
const Cormorants = require('cormorants');
const getFilters = require('./utils/get-filters');
const FILTERS = getFilters();

const TAG_STILL = 'still';
const TAG_MATCH = 'match:';
const TAG_EPISODE = 'episode:';

const getParameter = (ask, searchTag) => {
  const matchTag = ask.tags.find((tag) => tag.indexOf(searchTag) !== -1);
  return matchTag ? matchTag.split(searchTag)[1].trim() : null;
};

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
    const type = ask.tags.indexOf(TAG_STILL) !== -1 ? 'still' : 'gif';
    const filters = ask.tags.reduce(
      (memo, tag) => (FILTERS[tag] ? [...memo, FILTERS[tag]()] : memo),
      []
    );
    const matchText = getParameter(ask, TAG_MATCH);
    const sourceFilter = getParameter(ask, TAG_EPISODE);

    return {
      ask,
      filters,
      type,
      sourceFilter,
      num: captions.length,
      caption: new stills.captions.StaticMatch({
        captions,
        matchText,
      }),
    };
  }
}

module.exports = CormorantsConfig;
