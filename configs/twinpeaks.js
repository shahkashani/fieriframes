const stills = require('stills');

class TwinPeaksConfig {
  getOptions() {
    return {
      filterNum: {
        number: true,
        description: 'Which filter to run',
      },
      smart: {
        type: 'boolean',
        default: true,
        description: 'Use smart setup?',
      },
      width: {
        number: true,
        default: 1024,
        description: 'GIF widths',
      },
    };
  }

  async generateConfig(args) {
    const { filterNum, smart, width, eventInfo } = args;

    const type = 'gif';
    const colortone = new stills.filters.ColorTone();
    const coop = new stills.filters.Embed({
      width,
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

    const configs = [
      // 0
      {
        filters: [coop],
        captions: [
          "- You two had a big fight last week, didn't you?",
          '- So what?',
          'If I had a fight with her, if I sang songs with her,',
          'If I went skipping rope with her,',
          "What difference does it make? I didn't kill her!",
        ],
      },
      // 1
      {
        filters: [
          colortone,
          new stills.filters.Overlay({
            overlayFile: './overlays/twinpeaks/1.png',
            gravity: 'southeast',
            height: 0.6,
            horizontal: 0.05,
          }),
        ],
        captions: [
          'Every day, once a day, give yourself a present.',
          "Don't plan it, don't wait for it.",
          'Just let it happen.',
        ],
      },
      // 2
      {
        filters: [
          new stills.filters.Overlay({
            overlayFile: './blend/twinpeaks1.mp4',
            opacity: 0.5,
            fit: 'cover',
          }),
          colortone,
        ],
      },
      // 3
      {
        filters: [
          colortone,
          new stills.filters.Overlay({
            overlayFile: './overlays/twinpeaks/2.png',
            gravity: 'southeast',
            height: 0.6,
          }),
        ],
        captions: [
          "- Who's the lady with the log?",
          '- We call her the Log Lady.',
        ],
      },
      // 4
      {
        filters: [
          new stills.filters.Overlay({
            overlayFile: './blend/twinpeaks2.mp4',
            opacity: 0.7,
            fit: 'cover',
          }),
          colortone,
        ],
        captions: ["She's dead.", 'Wrapped in plastic.'],
      },
      // 5
      {
        filters: [
          new stills.filters.Overlay({
            overlayFile: './overlays/twinpeaks/3.png',
            gravity: 'southeast',
            height: 0.6,
            horizontal: 0.05,
          }),
          colortone,
        ],
        captions: [
          'There is a sadness in this world.',
          'For we are ignorant of many things.',
          'Yes, we are ignorant of many beautiful things.',
          'Things like the truth.',
          'So sadness in our ignorance is very real.',
          'Then the day when the sadness comes.',
          'And we ask...',
          'Will the sadness that makes me cry my heart out, will it ever end?',
          'The answer, of course, is yes.',
          'One day, the sadness will end.',
        ],
      },
      // 6
      {
        filters: [coop],
        captions: [
          "- Here's a hint: first initial 'J'.",
          '- No...',
          "...she wouldn't do that to me.",
          "- You didn't love her anyway.",
          'Let him go.',
        ],
      },
      // 7
      {
        filters: [
          new stills.filters.Overlay({
            overlayFile: './blend/twinpeaks3.mp4',
            opacity: 0.7,
            fit: 'cover',
          }),
          colortone,
        ],
        captions: ['No!', 'Oh, no!', 'No!'],
      },
      // 8
      {
        filters: [
          new stills.filters.Embed({
            width,
            background: './embed/nadine_1.jpg',
            backgrounds: [
              './embed/nadine_1.jpg',
              './embed/nadine_3.jpg',
              './embed/nadine_2.jpg',
            ],
            mask: './embed/nadine_mask.png',
            positions: [
              {
                x: 1290,
                y: 600,
                rotate: 20,
                width: 140,
                height: 160,
              },
            ],
          }),
        ],
        captions: [
          'I was up all night working on that invention.',
          "I'm going to have the world's first 100% quiet runner!",
          'Ed, you make me sick!',
        ],
      },
      // 9
      {
        filters: [
          new stills.filters.Overlay({
            overlayFile: './blend/twinpeaks16.mp4',
            opacity: 0.7,
            fit: 'cover',
          }),
          new stills.filters.Grayscale({
            contrast: 1.5,
            brightness: 1.2,
          }),
        ],
        captions: [
          'Within every soul, there is a battle between light and shadow.',
        ],
        filterCaption: new stills.filters.captions.Simple({
          font: './fonts/lynch.ttf',
        }),
      },
      // 10
      {
        filters: [
          new stills.filters.Embed({
            width,
            background: './embed/shelly_1.jpg',
            backgrounds: [
              './embed/shelly_1.jpg',
              './embed/shelly_2.jpg',
              './embed/shelly_3.jpg',
            ],
            mask: './embed/shelly_mask.png',
            positions: [
              {
                x: 0,
                y: 185,
                width: 337,
                height: 332,
              },
            ],
          }),
        ],
        captions: [
          '- Shelly, would you turn the television off?',
          '- Why, Leo? I want to see this.',
          '- Shelly, turn it off.',
        ],
      },
      // 11
      {
        filters: [
          new stills.filters.Embed({
            width,
            background: './embed/ronette_1.jpg',
            backgrounds: [
              './embed/ronette_1.jpg',
              './embed/ronette_2.jpg',
              './embed/ronette_3.jpg',
            ],
            mask: './embed/ronette_mask.png',
            positions: [
              {
                x: 1078,
                y: 0,
                width: 140,
                height: 95,
              },
            ],
          }),
        ],
        captions: [
          "Cooper: There's nothing here, not a thing.",
          "Ronette: Don't go there.",
          "Ronette: Don't go there.",
        ],
      },
      // 12
      {
        filters: [
          new stills.filters.Overlay({
            overlayFile: './overlays/twinpeaks/6.png',
            gravity: 'southeast',
            height: 0.6,
            horizontal: 0.05,
          }),
          colortone,
        ],
        captions: ['That just means like, more shit I gotta do now.'],
      },
      // 13
      {
        filters: [
          new stills.filters.Embed({
            width,
            background: './embed/albert_1.jpg',
            backgrounds: [
              './embed/albert_1.jpg',
              './embed/albert_2.jpg',
              './embed/albert_3.jpg',
            ],
            mask: './embed/albert_mask.png',
            positions: [
              {
                x: 893,
                y: 234,
                width: 511,
                height: 540,
              },
              {
                x: 863,
                y: 960,
                width: 533,
                height: 547,
                flip: true,
              },
            ],
          }),
        ],
        captions: [
          'Albert: Appear to be claw marks, bites of some kind.',
          'Harry: An animal?',
          "Albert: look, it's trying to think.",
        ],
      },
      // 14
      {
        filters: [
          new stills.filters.Overlay({
            overlayFile: './blend/twinpeaks13.mp4',
            opacity: 0.8,
            fit: 'cover',
          }),
          colortone,
        ],
        captions: ['I am the Arm...', 'And I...', 'Sound like this.'],
      },
      // 15
      {
        filters: [
          new stills.filters.Overlay({
            overlayFile: './blend/twinpeaks7.mp4',
            opacity: 0.7,
            fit: 'cover',
          }),
          colortone,
        ],
        captions: [
          'As the night wind blows, the boughs move to and fro.',
          'The rustling.',
          'The magic rustling that brings on the dark dream.',
          'The dream of suffering and pain.',
          'Pain for the victim, pain for the inflicter of pain.',
          'A circle of pain.',
          'A circle of suffering.',
          'Woe to ones who behold the pale horse.',
        ],
      },
      // 16
      {
        filters: [
          new stills.filters.Overlay({
            overlayFile: './overlays/twinpeaks/8.png',
            gravity: 'southeast',
            height: 0.6,
            horizontal: 0.05,
          }),
          colortone,
        ],
        captions: ['There was a fish...', '...in the perculator!'],
      },
      // 17
      {
        filters: [
          new stills.filters.Overlay({
            overlayFile: './blend/twinpeaks12.mp4',
            opacity: 0.5,
            fit: 'cover',
          }),
          colortone,
        ],
        captions: [
          'Through the dark of futures past, the magician longs to see.',
          'One chants out between two worlds.',
          'Fire walk with me.',
        ],
      },
      // 18
      {
        filters: [
          new stills.filters.Overlay({
            overlayFile: './blend/twinpeaks14.mp4',
            opacity: 0.8,
            fit: 'cover',
          }),
          colortone,
        ],
        captions: [
          'Actually,',
          'now that some time has passed,',
          'I like "the full blossom of the evening".',
        ],
      },
      // 19
      {
        filters: [
          new stills.filters.Overlay({
            overlayFile: './blend/twinpeaks11.mp4',
            opacity: 0.8,
            fit: 'cover',
          }),
          colortone,
        ],
      },
      // 20
      {
        filters: [
          new stills.filters.Overlay({
            overlayFile: './overlays/twinpeaks/10.png',
            gravity: 'southwest',
            height: 0.6,
            horizontal: 0.05,
          }),
          colortone,
        ],
      },
      // 21
      {
        filters: [
          new stills.filters.Overlay({
            overlayFile: './blend/twinpeaks10.mp4',
            opacity: 0.8,
            fit: 'cover',
          }),
          colortone,
        ],
      },
      // 22
      {
        filters: [
          new stills.filters.Overlay({
            overlayFile: './overlays/twinpeaks/11.png',
            gravity: 'southeast',
            height: 0.6,
            horizontal: 0.05,
          }),
          colortone,
        ],
        captions: ['Meanwhile...'],
      },
      // 23
      {
        filters: [
          new stills.filters.Overlay({
            overlayFile: './blend/twinpeaks15.mp4',
            opacity: 0.7,
            fit: 'cover',
          }),
          new stills.filters.Grayscale({
            contrast: 1.5,
            brightness: 1.2,
          }),
        ],
        captions: [
          'May everyone be happy.',
          'May everyone be free of disease.',
          'May auspiciousness be seen everywhere.',
          'May suffering belong to no one.',
          'Peace.',
        ],
        filterCaption: new stills.filters.captions.Balanced({
          font: './fonts/lynch.ttf',
        }),
      },
    ];

    const index = eventInfo
      ? Math.round(configs.length * eventInfo.progress)
      : 0;

    if (eventInfo && !Number.isFinite(filterNum)) {
      console.log(`🍩 Choosing index ${index}`);
    } else {
      console.log(`🍩 Using index ${filterNum}`);
    }

    const config = Number.isFinite(filterNum)
      ? configs[filterNum]
      : configs[index];

    return {
      type,
      gifWidth: width,
      skipModeration: true,
      isSmart: smart,
      caption: config.captions
        ? new stills.captions.Static({ captions: config.captions })
        : new stills.captions.Random({
            file: './captions/other/events/twinpeaks/twinpeaks.txt',
          }),
      filters: config.filters,
      filterCaption:
        config.filterCaption ||
        new stills.filters.captions.Balanced({
          font: './fonts/twinpeaks.ttf',
          fontSize: 0.9,
          distributionMinBoxWidth: 0.3,
        }),
    };
  }
}

module.exports = TwinPeaksConfig;
