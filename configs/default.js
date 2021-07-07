const stills = require('stills');
const { resolve } = require('path');
const { sync } = require('glob');
const { compact, random, sampleSize, sample, map } = require('lodash');

const randomly = (rate, hit = true, miss = false) =>
  Math.random() < rate ? hit : miss;

const inOrder = (array) => {
  const hour = new Date().getHours();
  const index = hour % array.length;
  return array[index];
};

const getCaption = (
  captionText,
  captionType,
  num,
  bannedWords = [],
  sourceSeconds = null
) => {
  if (!captionType || captionType === 'none') {
    return null;
  }
  const types = {
    ddd: new stills.captions.Episodes({ num, sourceSeconds }),
    quotes: new stills.captions.Quotes({ num, bannedWords }),
    books: new stills.captions.Books({ num, bannedWords }),
    static: new stills.captions.Static({
      captions: captionText,
    }),
  };

  return types[captionType] ? types[captionType] : null;
};

class DefaultConfig {
  getOptions() {
    return {
      type: {
        describe: 'The type of content to generate',
        choices: ['still', 'gif', 'random'],
        default: 'random',
      },
      captionType: {
        describe: 'What kind of caption to use',
        choices: ['ddd', 'quotes', 'books', 'none'],
      },
      num: {
        describe: 'The number of images to generate',
      },
      video: {
        describe: 'Always post a fierifiction video',
        boolean: false,
      },
      captionText: {
        describe: 'Custom captions to use',
        array: true,
      },
      effects: {
        describe: 'Which effects to apply',
        array: true,
      },
      preEffects: {
        describe: 'Which effects to always apply before',
        array: true,
      },
      postEffects: {
        describe: 'Which effects to always apply after',
        array: true,
      },
      tags: {
        describe: 'Additional tags to add',
        array: true,
        default: [],
      },
      morphFile: {
        describe: 'For the morph filter',
      },
      offset: {
        describe: 'For the faceoverlay filter',
        string: true,
      },
      face: {
        describe: 'Require a face',
        boolean: true,
      },
      eyes: {
        describe: 'Require big eyes',
        boolean: true,
      },
    };
  }

  getType({ type, GIF_STILL_RATE = 0.5 }) {
    return type !== 'random' ? type : randomly(GIF_STILL_RATE, 'gif', 'still');
  }

  getCaptionType({ captionType, captionText }, episodeCaptionRate) {
    if (captionType) {
      return captionType;
    }
    if (captionText) {
      return 'static';
    }
    return randomly(episodeCaptionRate, 'ddd', sample(['quotes', 'books']));
  }

  getDefaultNum(type, minNumber = 1) {
    return type === 'gif'
      ? randomly(0.8, minNumber, 3)
      : randomly(0.5, randomly(0.5, 3, 5), minNumber);
  }

  getNum({ type, num }, minNumber = 1) {
    return Number.isFinite(num) ? num : this.getDefaultNum(type, minNumber);
  }

  async generateConfig(args) {
    const {
      overlay,
      faceoverlay,
      scale,
      offset,
      effects,
      preEffects,
      postEffects,
      tags,
      video,
      face,
      body,
      eyes,
      embed,
      captionText,
      sourceSeconds,
      MAX_NUM_EFFECTS,
      GIF_EFFECT_RATE,
      FIERIFICTION_VIDEO_RATE,
      MAX_FACE_OVERLAYS,
      BANNED_WORDS,
      AFTER_CAPTION_EFFECT_RATE,
      EPISODE_CAPTION_RATE,
    } = args;

    const maxNumEffects = MAX_NUM_EFFECTS ? parseInt(MAX_NUM_EFFECTS, 10) : 1;
    const USE_GIF_EFFECT_RATE = GIF_EFFECT_RATE
      ? parseFloat(GIF_EFFECT_RATE)
      : 0.2;
    const NUM_FIERIFICTION_VIDEO_RATE = FIERIFICTION_VIDEO_RATE
      ? parseFloat(FIERIFICTION_VIDEO_RATE)
      : 0;
    const NUM_MAX_FACE_OVERLAYS = MAX_FACE_OVERLAYS
      ? parseInt(MAX_FACE_OVERLAYS, 10)
      : 1;
    const USE_AFTER_CAPTION_EFFECT_RATE = AFTER_CAPTION_EFFECT_RATE
      ? parseFloat(AFTER_CAPTION_EFFECT_RATE)
      : 0;
    const USE_EPISODE_CAPTION_RATE = EPISODE_CAPTION_RATE
      ? parseFloat(EPISODE_CAPTION_RATE)
      : 0.9;

    const getEffectsByName = (allEffects, effects) => {
      const allEffectsNames = map(allEffects, 'name');

      return effects.reduce(
        (memo, name) =>
          allEffectsNames.indexOf(name) !== -1
            ? [...memo, allEffects[allEffectsNames.indexOf(name)]]
            : memo,
        []
      );
    };

    const type = this.getType(args);
    const captionType = this.getCaptionType(args, USE_EPISODE_CAPTION_RATE);
    const num = this.getNum(args);
    const avoidDescriptors = [resolve('./faces/guy-fieri.json')];

    const orbs = [
      {
        radius: 0.4,
        blur: 0.4,
        color: '#ffa500',
      },
      {
        radius: 0.1,
        blur: 0.3,
        color: 'white',
      },
    ];

    const blendFiles = sync(`./blend/**/*.mp4`);

    const overlays = [
      {
        overlayFile: './overlays/birthday-0.png',
        gravity: 'southeast',
        sizePercentHeight: 0.6,
      },
      {
        overlayFile: './overlays/birthday-7.png',
        gravity: 'southeast',
        sizePercentHeight: 0.8,
      },
      {
        overlayFile: './overlays/birthday-1.png',
        gravity: 'southwest',
        sizePercentHeight: 0.9,
      },
      {
        overlayFile: './overlays/birthday-2.png',
        gravity: 'southeast',
        sizePercentHeight: 0.9,
      },
      {
        overlayFile: './overlays/birthday-8.png',
        gravity: 'south',
        sizePercentHeight: 0.8,
      },
      {
        overlayFile: './overlays/birthday-4.png',
        gravity: 'southwest',
        sizePercentHeight: 0.8,
      },
      {
        overlayFile: './overlays/birthday-5.png',
        gravity: 'southwest',
        sizePercentHeight: 0.7,
      },
      {
        overlayFile: './overlays/birthday-3.png',
        gravity: 'southeast',
        sizePercentHeight: 1,
      },
      {
        overlayFile: './overlays/birthday-10.png',
        gravity: 'southwest',
        sizePercentHeight: 0.8,
      },
      {
        overlayFile: './overlays/birthday-9.png',
        gravity: 'southeast',
        sizePercentHeight: 0.6,
      },
      {
        overlayFile: './overlays/pilt.png',
        gravity: 'southeast',
        sizePercentHeight: 0.6,
      },
      {
        overlayFile: './overlays/guy-and-phil.png',
        gravity: 'southeast',
        sizePercentHeight: 0.6,
        geometry: '+20%',
      },
      {
        overlayFile: './overlays/sadphil.png',
        gravity: 'southwest',
        sizePercentHeight: 0.8,
        geometry: '+20%',
      },
      {
        overlayFile: './overlays/sadphil2.png',
        gravity: 'southwest',
        sizePercentWidth: 0.3,
        geometry: '+20%',
      },
      {
        overlayFile: './overlays/askeep.png',
        gravity: 'southwest',
        sizePercentWidth: 0.3,
        geometry: '+10%',
      },
      {
        overlayFile: './overlays/carrot.png',
        gravity: 'south',
        sizePercentWidth: 0.1,
        geometry: '+0+40%',
      },
    ].filter((o) =>
      overlay ? o.overlayFile.startsWith(`./overlays/${overlay}`) : true
    );

    const faceOverlayFiles = sync(`./faceoverlays/*.{png,gif}`);
    const faceOverlayFile = faceoverlay
      ? faceOverlayFiles.filter((file) =>
          file.startsWith(`./faceoverlays/${faceoverlay}`)
        )
      : sampleSize(faceOverlayFiles, NUM_MAX_FACE_OVERLAYS);

    const overlayOptions = inOrder(overlays);

    const sharedEffects = [
      new stills.filters.FaceOrb({ orbs }),
      new stills.filters.FaceZoom(),
      new stills.filters.FaceDemonEyes({
        avoidDescriptors,
      }),
      new stills.filters.FacePinch({
        avoidDescriptors,
      }),
      new stills.filters.Liquify(),
      new stills.filters.Mirror(),
      new stills.filters.Overlay(overlayOptions),
      new stills.filters.FaceOverlay({
        offset,
        overlayFile: faceOverlayFile,
        scale: scale ? parseFloat(scale) : 2,
      }),
      new stills.filters.Backdrop({
        segmentationThreshold: 0.6,
      }),
      new stills.filters.Mesh({
        masks: ['./masks/phil.png'],
      }),
    ];

    const stillEffects = [...sharedEffects, new stills.filters.FaceStretch()];

    const gifEffects = [
      ...sharedEffects,
      new stills.filters.Distortion({
        heightFactor: random(0.4, 0.6),
      }),
      new stills.filters.Shuffle({
        delay: '2x30',
      }),
      new stills.filters.Stutter({
        numFrames: random(6, 16),
        stutterDelay: 0,
      }),
      new stills.filters.Invert(),
      new stills.filters.Reverse(),
      new stills.filters.Implode(),
      new stills.filters.Swirl(),
      new stills.filters.Flop(),
      new stills.filters.Jitter(),
      new stills.filters.FaceStretch({
        useProgress: true,
        randomOffset: 0,
      }),
      new stills.filters.FewFrames(),
      new stills.filters.Pip(),
      new stills.filters.Flash(),
      new stills.filters.Station(),
      new stills.filters.BlendSelf(),
      new stills.filters.Blend({
        opacity: 0.5,
        overlayFile: sample(blendFiles),
      }),
      new stills.filters.Boomerang(),
      new stills.filters.RepeatFrame({
        delay: 0,
      }),
      new stills.filters.FaceSwirl(),
      new stills.filters.Blink({
        source: sample(blendFiles),
      }),
    ];

    const afterCaptionEffects = [
      new stills.filters.Embed({
        background: './embed/shrek.jpg',
        mask: './embed/shrek_mask.png',
        positions: [
          {
            x: 470,
            y: 600,
            width: 465,
            height: 300,
          },
        ],
      }),
      new stills.filters.Embed({
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
      }),
    ];

    let allEffects = type === 'gif' ? gifEffects : stillEffects;

    let useEffects = effects
      ? getEffectsByName(allEffects, effects)
      : randomly(
          USE_GIF_EFFECT_RATE,
          sampleSize(allEffects, random(1, maxNumEffects)),
          []
        );

    let usePreEffects = preEffects
      ? getEffectsByName(allEffects, preEffects)
      : [];

    let usePostEffects = postEffects
      ? getEffectsByName(allEffects, postEffects)
      : [];

    const useAfterCaptionEffects = embed
      ? afterCaptionEffects.filter((e) => e.background.indexOf(embed) !== -1)
      : randomly(
          USE_AFTER_CAPTION_EFFECT_RATE,
          [sample(afterCaptionEffects)],
          []
        );

    const filters = compact([
      ...usePreEffects,
      ...useEffects,
      ...usePostEffects,
      new stills.filters.Captions({
        folder: resolve('./captions'),
        font: resolve('./fonts/arial.ttf'),
        glyphs: false,
      }),
      ...useAfterCaptionEffects,
    ]);

    const isCreateFiction =
      video || Math.random() < NUM_FIERIFICTION_VIDEO_RATE;

    const validators = [];

    if (face) {
      validators.push(new stills.validators.FaceDetection());
    }

    if (eyes) {
      validators.push(new stills.validators.EyeDetection());
    }

    if (body) {
      validators.push(new stills.validators.BodyDetection());
    }

    const caption = getCaption(
      captionText,
      captionType,
      num,
      BANNED_WORDS,
      sourceSeconds
    );

    return {
      type,
      tags,
      filters,
      caption,
      validators,
      isCreateFiction,
    };
  }
}

module.exports = DefaultConfig;
