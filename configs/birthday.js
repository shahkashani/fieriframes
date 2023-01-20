const stills = require('stills');

const FOLDER = './overlays/birthday-2023';

class BirthdayConfig {
  async generateConfig(args) {
    const type = Math.random() > 0.4 ? 'gif' : 'still';
    const { overlay } = args;

    const overlays = [
      {
        overlayFile: `${FOLDER}/columbo1.png`,
        gravity: 'southwest',
        sizePercentHeight: 0.9,
        geometry: '+10%+10%',
      },
      {
        overlayFile: `${FOLDER}/alvin.png`,
        gravity: 'southeast',
        sizePercentWidth: 0.5,
      },
      {
        overlayFile: `${FOLDER}/columbo2.png`,
        gravity: 'southeast',
        sizePercentHeight: 0.8,
        geometry: '+10%',
      },
      {
        overlayFile: `${FOLDER}/darkplace.png`,
        gravity: 'southeast',
        sizePercentHeight: 0.6,
        geometry: '+10%',
      },
      {
        overlayFile: `${FOLDER}/columbo3.png`,
        gravity: 'southeast',
        sizePercentHeight: 0.7,
      },
      {
        overlayFile: `${FOLDER}/gake.png`,
        gravity: 'southeast',
        sizePercentHeight: 0.9,
        geometry: '+10%',
      },
      {
        overlayFile: `${FOLDER}/columbo4.png`,
        gravity: 'southwest',
        sizePercentHeight: 0.7,
        geometry: '+10%',
      },
      {
        overlayFile: `${FOLDER}/jim.png`,
        gravity: 'southwest',
        sizePercentHeight: 0.9,
        geometry: '+10%',
      },
      {
        overlayFile: `${FOLDER}/manimal1.png`,
        gravity: 'southwest',
        sizePercentWidth: 0.6,
      },
      {
        overlayFile: `${FOLDER}/perfect.png`,
        gravity: 'southwest',
        sizePercentHeight: 0.7,
      },
      {
        overlayFile: `${FOLDER}/radiatorlady.png`,
        gravity: 'southeast',
        sizePercentHeight: 0.8,
        geometry: '+10%',
        filters: [new stills.filters.Grayscale()],
      },
      {
        overlayFile: `${FOLDER}/manimal2.png`,
        gravity: 'southeast',
        sizePercentHeight: 0.7,
      },
      {
        overlayFile: `${FOLDER}/toast.png`,
        gravity: 'southeast',
        sizePercentHeight: 0.9,
        geometry: '+10%',
      },
    ].filter((o) => (overlay ? o.overlayFile.indexOf(overlay) !== -1 : true));

    const chosenFilter = stills.utils.inOrder(overlays);
    const overlayFilter = new stills.filters.Overlay(chosenFilter);
    const additionalFilters = chosenFilter.filters || [];

    return {
      type,
      tags: ['happy birthday'],
      caption: new stills.captions.Quotes({
        folder: './captions/other/events/birthday',
        num: 1,
      }),
      filters: [overlayFilter, ...additionalFilters],
    };
  }
}

module.exports = BirthdayConfig;
