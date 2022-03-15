const stills = require('stills');

class BirthdayConfig {
  async generateConfig(args) {
    const type = Math.random() > 0.3 ? 'gif' : 'still';
    const { overlay } = args;

    const overlays = [
      {
        overlayFile: './overlays/birthday-2022/7.png',
        gravity: 'southwest',
        sizePercentHeight: 0.9,
        geometry: '+10%',
      },
      {
        overlayFile: './overlays/birthday-2022/1.png',
        gravity: 'southwest',
        sizePercentHeight: 0.9,
        geometry: '+10%',
      },
      {
        overlayFile: './overlays/birthday-2022/2.png',
        gravity: 'southwest',
        sizePercentHeight: 0.5,
        geometry: '+10%+10%',
      },
      {
        overlayFile: './overlays/birthday-2022/3.png',
        gravity: 'southwest',
        sizePercentHeight: 0.8,
        geometry: '+10%',
      },
      {
        overlayFile: './overlays/birthday-2022/6.png',
        gravity: 'southeast',
        sizePercentHeight: 0.9,
        geometry: '+10%',
      },
      {
        overlayFile: './overlays/birthday-2022/4.png',
        gravity: 'southeast',
        sizePercentHeight: 0.6,
        geometry: '+10%+10%',
      },
      {
        overlayFile: './overlays/birthday-2022/5.png',
        gravity: 'southeast',
        sizePercentHeight: 0.9,
        geometry: '+10%+10%',
      },
      {
        overlayFile: './overlays/birthday-2022/6.png',
        gravity: 'southeast',
        sizePercentHeight: 0.9,
        geometry: '+10%',
      },
      {
        overlayFile: './overlays/birthday-2022/8.png',
        gravity: 'southeast',
        sizePercentHeight: 0.9,
      },
      {
        overlayFile: './overlays/birthday-2022/9.png',
        gravity: 'southeast',
        sizePercentHeight: 0.9,
      },
      {
        overlayFile: './overlays/birthday-2022/7.png',
        gravity: 'southwest',
        sizePercentHeight: 0.9,
        geometry: '+10%',
      },
    ].filter((o) => (overlay ? o.overlayFile.indexOf(overlay) !== -1 : true));

    const overlayFilter = new stills.filters.Overlay(stills.utils.inOrder(overlays));

    return {
      type,
      tags: ['happy birthday'],
      caption: new stills.captions.Quotes({
        folder: './captions/other/events/birthday',
        num: 1,
      }),
      filters: [overlayFilter],
    };
  }
}

module.exports = BirthdayConfig;