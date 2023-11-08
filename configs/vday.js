const stills = require('stills');

class BirthdayConfig {
  async generateConfig(args) {
    const type = Math.random() > 0.3 ? 'gif' : 'still';
    const { overlay } = args;

    const overlays = [
      {
        overlayFile: './overlays/vday/vday1.png',
        gravity: 'southeast',
        height: 0.7,
        horizontal: 0.02,
      },
      {
        overlayFile: './overlays/vday/vday2.png',
        gravity: 'southeast',
        height: 0.7,
        horizontal: 0.02,
      },
      {
        overlayFile: './overlays/vday/vday3.png',
        gravity: 'southeast',
        height: 0.7,
      },
    ].filter((o) => (overlay ? o.overlayFile.indexOf(overlay) !== -1 : true));

    const overlayFilter = new stills.filters.Overlay(
      stills.utils.inOrder(overlays)
    );

    return {
      type,
      caption: new stills.captions.Quotes({
        folder: './captions/other/events/vday',
        num: 1,
      }),
      filters: [overlayFilter],
    };
  }
}

module.exports = BirthdayConfig;
