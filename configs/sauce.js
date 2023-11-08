const stills = require('stills');

class SauceConfig {
  async generateConfig() {
    const day = new Date().getDate();
    const isSauce = day % 2 === 0;
    const type = isSauce ? 'gif' : 'still';
    const overlayFilter = isSauce
      ? new stills.filters.Overlay({
          overlayFile: './overlays/sauce_verified.gif',
          gravity: 'south',
          width: 0.15,
          vertical: 0.05,
        })
      : new stills.filters.Overlay({
          overlayFile: './overlays/carrot.png',
          gravity: 'south',
          width: 0.1,
          vertical: 0.03,
        });

    return {
      type,
      descriptionText: '[🥕]',
      tags: ['sauce', '🥕'],
      filters: [overlayFilter],
    };
  }
}

module.exports = SauceConfig;
