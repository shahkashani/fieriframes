const tumblr = require('tumblr.js');
const { map, without, sample, sampleNum } = require('lodash');

class TumblrUtil {
  constructor({
    consumerKey = null,
    consumerSecret = null,
    tokenKey = null,
    tokenSecret = null,
    blogName = null,
    numPosts = 10,
  } = {}) {
    this.blogName = blogName;
    this.numPosts = numPosts;
    this.client = tumblr.createClient({
      token: tokenKey,
      token_secret: tokenSecret,
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
      returnPromises: true,
    });
  }

  async getNoteUsers() {
    const data = await this.client.blogPosts(`${this.blogName}.tumblr.com`, {
      notes_info: true,
      limit: this.numPosts,
    });
    return (data.posts || []).reduce((memo, post) => {
      const blogNames = without(map(post.notes, 'blog_name'), this.blogName);
      memo.push.apply(memo, blogNames);
      return memo;
    }, []);
  }

  async getRandomUser(num = 1) {
    const users = await this.getNoteUsers();
    return num > 1 ? sampleNum(users, num) : sample(users);
  }
}

module.exports = TumblrUtil;
