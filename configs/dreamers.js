const stills = require('stills');
const Dreamers = require('dreamers');

const HIGHLIGHT_COLOR = '#FF492F';

class DreamerConfig {
  constructor() {
    this.effects = Object.values(stills.filters).reduce(
      (memo, f) => ({ ...memo, [f.name]: f }),
      {}
    );
  }

  async generateConfig({
    DREAMERS_ACCESS_TOKEN_KEY,
    DREAMERS_ACCESS_TOKEN_SECRET,
    TUMBLR_CONSUMER_KEY,
    TUMBLR_CONSUMER_SECRET,
    DREAMERS_BLOG_NAME,
    DREAMERS_OWNER_BLOG_NAME,
  }) {
    this.dreamers = new Dreamers({
      consumerKey: TUMBLR_CONSUMER_KEY,
      consumerSecret: TUMBLR_CONSUMER_SECRET,
      accessTokenKey: DREAMERS_ACCESS_TOKEN_KEY,
      accessTokenSecret: DREAMERS_ACCESS_TOKEN_SECRET,
      blogName: DREAMERS_BLOG_NAME,
      ownerBlogName: DREAMERS_OWNER_BLOG_NAME,
    });
    const post = await this.dreamers.getNextPost();
    if (!post) {
      console.warn(`💀 There is nothing to post.`);
      process.exit(0);
    }
    const { captions, tags, effects, author, id, deleteIds } = post;
    const filters = effects.reduce((memo, { type, params }) => {
      const fn = this.effects[type];
      if (fn) {
        memo.push(new fn(params));
      }
      return memo;
    }, []);

    console.log(`💀 Using post ${id} by author ${author}`);

    return {
      data: {
        deleteIds,
      },
      tags,
      type: 'gif',
      num: captions.length,
      highlightColor: HIGHLIGHT_COLOR,
      caption: new stills.captions.Static({
        captions,
      }),
      filters: [...filters, new stills.filters.Arcadia()],
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

module.exports = DreamerConfig;
