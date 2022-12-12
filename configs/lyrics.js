const stills = require('stills');

class LyricsConfig {
  async generateConfig(args) {
    const file = './captions/other/events/lyrics/lyrics.txt';
    return {
      type: Math.random() > 0.5 ? 'gif' : 'still',
      caption: new stills.captions.Ordered({
        file,
      }),
    };
  }
}

module.exports = LyricsConfig;
