const stills = require('stills');

class ArcadiaConfig {
  getOptions() {
    return {
      captionText: {
        describe: 'Captions to use',
        array: true,
        demandOption: true,
      },
    };
  }

  async generateConfig(args) {
    const { captionText } = args;
    return {
      type: 'gif',
      num: captionText.length,
      caption: new stills.captions.Static({
        captions: captionText,
      }),
      filters: [new stills.filters.Arcadia(), new stills.filters.Captions()],
    };
  }
}

module.exports = ArcadiaConfig;
