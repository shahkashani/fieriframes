const stills = require('stills');

class ArcadiaConfig {
  getOptions() {
    return {
      captionText: {
        describe: 'Captions to use',
        array: true,
        demandOption: true,
      },
      match: {
        default: true,
        boolean: true,
      },
    };
  }

  async generateConfig(args) {
    const { captionText, match } = args;
    return {
      isSmart: true,
      skipModeration: true,
      type: 'gif',
      num: captionText.length,
      caption: match ? new stills.captions.StaticMatch({
        captions: captionText,
      }) : new stills.captions.Static({
        captions: captionText,
      }),
      filters: [new stills.filters.Arcadia()],
    };
  }
}

module.exports = ArcadiaConfig;
