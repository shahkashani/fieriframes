const stills = require('stills');

const inOrder = (array) => {
  const hour = new Date().getHours();
  const index = hour % array.length;
  return array[index];
};

class BirthdayConfig {
  async generateConfig(args) {
    const captionFilter = new stills.filters.Captions();
    const type = Math.random() > 0.3 ? 'gif' : 'still';
    const { overlay } = args;

    const overlays = [
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
        overlayFile: './overlays/birthday-2022/10.png',
        gravity: 'southwest',
        sizePercentHeight: 0.8,
      },
      {
        overlayFile: './overlays/birthday-2022/7.png',
        gravity: 'southwest',
        sizePercentHeight: 0.9,
        geometry: '+10%',
      },
      {
        overlayFile: './overlays/birthday-2022/11.png',
        gravity: 'southwest',
        sizePercentHeight: 0.7,
      },
      {
        overlayFile: './overlays/birthday-2022/12.png',
        gravity: 'southwest',
        sizePercentHeight: 0.8,
      },
    ].filter((o) => (overlay ? o.overlayFile.indexOf(overlay) !== -1 : true));

    const overlayFilter = new stills.filters.Overlay(inOrder(overlays));

    return {
      type,
      tags: ['happy birthday'],
      caption: new stills.captions.Quotes({
        folder: './captions/other/events',
        num: 1,
      }),
      filters: [overlayFilter, captionFilter],
    };
  }
}

module.exports = BirthdayConfig;
