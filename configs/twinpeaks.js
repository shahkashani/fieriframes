const stills = require('stills');

class TwinPeaksConfig {
  getOptions() {
    return {
      filterNum: {
        number: true,
        description: 'Which filter to run',
      },
    };
  }

  async generateConfig(args) {
    const { filterNum } = args;
    const type = 'gif';
    const colortone = new stills.filters.ColorTone();
    const embed = new stills.filters.Embed({
      background: './embed/coop_3.jpg',
      backgrounds: [
        './embed/coop_1.jpg',
        './embed/coop_2.jpg',
        './embed/coop_3.jpg',
        './embed/coop_4.jpg',
        './embed/coop_5.jpg',
      ],
      mask: './embed/coop_mask.png',
      positions: [
        {
          x: 449,
          y: 281,
          width: 104,
          height: 78,
        },
        {
          x: 452,
          y: 426,
          width: 104,
          height: 78,
          flip: true,
        },
      ],
    });

    const filters = [
      [embed],
      [
        colortone,
        new stills.filters.Overlay({
          overlayFile: './overlays/twinpeaks/1.png',
          gravity: 'southeast',
          height: 0.6,
          horizontal: 0.05,
        }),
      ],
      [
        new stills.filters.Overlay({
          overlayFile: './blend/twinpeaks1.mp4',
          opacity: 0.5,
        }),
        colortone,
      ],
      [
        colortone,
        new stills.filters.Overlay({
          overlayFile: './overlays/twinpeaks/2.png',
          gravity: 'southeast',
          height: 0.6,
        }),
      ],
      [
        new stills.filters.Overlay({
          overlayFile: './blend/twinpeaks2.mp4',
          opacity: 0.5,
        }),
        colortone,
      ],
      [
        colortone,
        new stills.filters.Overlay({
          overlayFile: './overlays/twinpeaks/3.png',
          gravity: 'southeast',
          height: 0.6,
          horizontal: 0.05,
        }),
      ],
      [
        new stills.filters.Overlay({
          overlayFile: './blend/twinpeaks3.mp4',
          opacity: 0.5,
        }),
        colortone,
      ],
      [
        colortone,
        new stills.filters.Overlay({
          overlayFile: './overlays/twinpeaks/4.png',
          gravity: 'southeast',
          height: 0.6,
        }),
      ],
      [
        new stills.filters.Overlay({
          overlayFile: './blend/twinpeaks4.mp4',
          opacity: 0.5,
        }),
        colortone,
      ],
      [
        colortone,
        new stills.filters.Overlay({
          overlayFile: './overlays/twinpeaks/5.png',
          gravity: 'southeast',
          height: 0.6,
          horizontal: 0.05,
        }),
      ],
      [
        new stills.filters.Overlay({
          overlayFile: './blend/twinpeaks5.mp4',
          opacity: 0.5,
        }),
        colortone,
      ],
      [
        colortone,
        new stills.filters.Overlay({
          overlayFile: './overlays/twinpeaks/6.png',
          gravity: 'southeast',
          height: 0.6,
          horizontal: 0.05,
        }),
      ],
      [
        new stills.filters.Overlay({
          overlayFile: './blend/twinpeaks6.mp4',
          opacity: 0.5,
        }),
        colortone,
      ],
      [
        colortone,
        new stills.filters.Overlay({
          overlayFile: './overlays/twinpeaks/7.png',
          gravity: 'southeast',
          height: 0.6,
          horizontal: 0.05,
        }),
      ],
      [
        new stills.filters.Overlay({
          overlayFile: './blend/twinpeaks7.mp4',
          opacity: 0.5,
        }),
        colortone,
      ],
      [
        colortone,
        new stills.filters.Overlay({
          overlayFile: './overlays/twinpeaks/8.png',
          gravity: 'southeast',
          height: 0.6,
          horizontal: 0.05,
        }),
      ],
      [
        new stills.filters.Overlay({
          overlayFile: './blend/twinpeaks12.mp4',
          opacity: 0.5,
        }),
        colortone,
      ],
      [
        colortone,
        new stills.filters.Overlay({
          overlayFile: './overlays/twinpeaks/9.png',
          gravity: 'southeast',
          height: 0.6,
          horizontal: 0.05,
        }),
      ],
      [
        new stills.filters.Overlay({
          overlayFile: './blend/twinpeaks11.mp4',
          opacity: 0.5,
        }),
        colortone,
      ],
      [
        colortone,
        new stills.filters.Overlay({
          overlayFile: './overlays/twinpeaks/10.png',
          gravity: 'southwest',
          height: 0.6,
          horizontal: 0.05,
        }),
      ],
      [
        new stills.filters.Overlay({
          overlayFile: './blend/twinpeaks10.mp4',
          opacity: 0.5,
        }),
        colortone,
      ],
      [
        colortone,
        new stills.filters.Overlay({
          overlayFile: './overlays/twinpeaks/11.png',
          gravity: 'southeast',
          height: 0.6,
          horizontal: 0.05,
        }),
      ],
      [
        colortone,
        new stills.filters.Overlay({
          overlayFile: './overlays/twinpeaks/13.png',
          gravity: 'southeast',
          height: 0.6,
          horizontal: 0.05,
        }),
      ],
      [
        colortone,
        new stills.filters.Overlay({
          overlayFile: './overlays/twinpeaks/15.png',
          gravity: 'southeast',
          height: 0.6,
          horizontal: 0.05,
        }),
        embed,
      ],
    ];

    const filter = stills.utils.inOrder(filters, true, filterNum);

    return {
      type,
      isSmart: true,
      caption: new stills.captions.Ordered({
        file: './captions/other/events/twinpeaks/twinpeaks.txt',
        index: filterNum,
      }),
      filters: filter,
    };
  }
}

module.exports = TwinPeaksConfig;
