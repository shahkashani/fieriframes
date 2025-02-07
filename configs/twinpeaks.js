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
    };
  }

  async generateConfig(args) {
    const { filterNum, smart } = args;
    const type = 'gif';
    const colortone = new stills.filters.ColorTone();
    const coop = new stills.filters.Embed({
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

    const shelly = new stills.filters.Embed({
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
    });

    const nadine = new stills.filters.Embed({
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
    });

    const configs = [
      {
        filters: [coop],
        captions: [
          "COOPER: You two had a big fight last week, didn't you?",
          'BOBBY: So what?',
          'If I had a fight with her, if I sang songs with her,',
          'If I went skipping rope with her,',
          "What difference does it make? I didn't kill her!",
        ],
      },
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
      {
        filters: [coop],
        captions: [
          "COOPER: Here's a hint: first initial 'J'.",
          'BOBBY: No...',
          "...she wouldn't do that to me.",
          "COOPER: You didn't love her anyway.",
          'Let him go.',
        ],
      },
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
      {
        filters: [nadine],
        captions: [
          'I was up all night working on that invention.',
          "I'm going to have the world's first 100% quiet runner!",
          'Ed, you make me sick!',
        ],
      },
      {
        filters: [
          colortone,
          new stills.filters.Overlay({
            overlayFile: './overlays/twinpeaks/4.png',
            gravity: 'southeast',
            height: 0.6,
          }),
        ],
        captions: [
          'Within every soul, there is a battle between light and shadow.',
        ],
      },
      {
        filters: [shelly],
        captions: [
          'LEO: Shelly, would you turn the television off?',
          'SHELLY: Why, Leo? I want to see this.',
          'LEO: Shelly, turn it off.',
        ],
      },
      {
        filters: [
          new stills.filters.Overlay({
            overlayFile: './blend/twinpeaks5.mp4',
            opacity: 0.5,
            fit: 'cover',
          }),
          colortone,
        ],
        captions: ["I've never seen so many trees in my life."],
      },
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
      {
        filters: [
          new stills.filters.Overlay({
            overlayFile: './blend/twinpeaks6.mp4',
            opacity: 0.7,
            fit: 'cover',
          }),
          colortone,
        ],
      },
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
      {
        filters: [
          new stills.filters.Overlay({
            overlayFile: './blend/twinpeaks15.mp4',
            opacity: 0.8,
            fit: 'cover',
          }),
          new stills.filters.Grayscale(),
        ],
        captions: ['See you in the trees, David.'],
      },
    ];

    const config = stills.utils.inOrder(configs, true, filterNum);

    return {
      type,
      skipModeration: true,
      isSmart: smart,
      caption: config.captions
        ? new stills.captions.Static({ captions: config.captions })
        : new stills.captions.Random({
            file: './captions/other/events/twinpeaks/twinpeaks.txt',
          }),
      filters: config.filters,
    };
  }
}

module.exports = TwinPeaksConfig;
