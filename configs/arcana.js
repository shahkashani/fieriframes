const stills = require('stills');
const { resolve } = require('path');

class ArcanaConfig {
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
      filters: [new stills.filters.Arcana()],
      filterCaption: new stills.filters.captions.Simple({
        font: resolve('./fonts/brassia.otf'),
        fontSize: 0.85,
        color: '#fba155',
        boxWidth: 0.8,
        bottomOffset: 1.2,
      }),
    };
  }
}

module.exports = ArcanaConfig;
