const stills = require('stills');

class CleanConfig {
  getOptions() {
    return {
      type: {
        describe: 'The type of content to generate',
        choices: ['still', 'gif'],
        default: 'gif',
      },
      num: {
        describe: 'The number of images to generate',
      },
      captionText: {
        describe: 'Optional caption',
        array: true,
        default: [],
      },
    };
  }

  async generateConfig(args) {
    const { type, num, captionText } = args;

    return {
      type,
      skipModeration: true,
      num: Number.isFinite(num) ? num : 1,
      tags: [],
      caption:
        captionText.length > 0
          ? new stills.captions.Static({ captions: captionText })
          : new stills.captions.Episodes(),
    };
  }
}

module.exports = CleanConfig;
