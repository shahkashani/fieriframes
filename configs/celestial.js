const stills = require('stills');
const Dreamers = require('dreamers');

const HIGHLIGHT_COLOR = '#cccccc';

class CelestialConfig {
  constructor() {
    this.effects = Object.values(stills.filters).reduce(
      (memo, f) => ({ ...memo, [f.name]: f }),
      {}
    );
  }

  getOptions() {
    return {
      preview: {
        describe: 'Only process preview requests',
        boolean: true,
        default: false,
      },
    };
  }

  async generateConfig({
    CELESTIAL_ACCESS_TOKEN_KEY,
    CELESTIAL_ACCESS_TOKEN_SECRET,
    CELESTIAL_BLOG_NAME,
    TUMBLR_CONSUMER_KEY,
    TUMBLR_CONSUMER_SECRET,
    preview,
  }) {
    this.dreamers = new Dreamers({
      consumerKey: TUMBLR_CONSUMER_KEY,
      consumerSecret: TUMBLR_CONSUMER_SECRET,
      accessTokenKey: CELESTIAL_ACCESS_TOKEN_KEY,
      accessTokenSecret: CELESTIAL_ACCESS_TOKEN_SECRET,
      blogName: CELESTIAL_BLOG_NAME,
    });
    const post = await this.dreamers.getNextPost();
    if (!post) {
      console.warn(`💀 There is nothing to post.`);
      process.exit(0);
    }
    const {
      captions,
      tags,
      effects,
      author,
      id,
      deleteIds,
      isCreateDraft,
      passthrough,
    } = post;
    const filters = effects.reduce((memo, { type, params }) => {
      const fn = this.effects[type];
      if (fn) {
        memo.push(new fn(params));
      }
      return memo;
    }, []);

    console.log(
      `💀 Using post ${id} by author ${author} ${
        isCreateDraft ? 'for preview request!' : ''
      }`
    );

    if (!isCreateDraft && preview) {
      console.log(
        `💀 I was told to only process preview requests, and this is not one!`
      );
      process.exit(0);
    }

    const base = isCreateDraft
      ? { blogName: CELESTIAL_BLOG_NAME, isDraft: true }
      : {};

    return {
      ...base,
      data: {
        deleteIds,
      },
      passthrough,
      tags,
      type: 'gif',
      num: captions.length,
      highlightColor: HIGHLIGHT_COLOR,
      globals: [
        new stills.globals.Captions({
          captionText: captions,
        }),
      ],
      filters: [
        new stills.filters.Celestial(),
        ...filters,
        new stills.filters.Captions(),
      ],
    };
  }

  async onComplete({ destinations }, { deleteIds }) {
    const isPosted = Object.keys(destinations).length > 0;
    if (isPosted && deleteIds) {
      for (const id of deleteIds) {
        console.log(`💀 Deleting post ${id}...`);
        await this.dreamers.deletePost(id);
      }
    }
  }
}

module.exports = CelestialConfig;
