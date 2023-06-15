const stills = require('stills');

class SauceConfig {
  async generateConfig() {
    const day = new Date().getDate();
    const isSauce = day % 2 === 1;
    const type = isSauce ? 'gif' : 'still';
    const overlayFilter = isSauce
      ? new stills.filters.Overlay({
          overlayFile: './overlays/sauce_verified_small.gif',
          gravity: 'south',
          sizePercentWidth: 0.15,
          geometry: '+0+20%',
        })
      : new stills.filters.Overlay({
          overlayFile: './overlays/carrot.png',
          gravity: 'south',
          sizePercentWidth: 0.1,
          geometry: '+0+40%',
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
