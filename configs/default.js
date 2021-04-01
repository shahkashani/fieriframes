const stills = require('stills');
const { resolve } = require('path');
const { sync } = require('glob');
const {
  compact,
  random,
  sampleSize,
  intersection,
  sample,
  map,
} = require('lodash');

const randomly = (rate, hit = true, miss = false) =>
  Math.random() < rate ? hit : miss;

const inOrder = (array) => {
  const hour = new Date().getHours();
  const index = hour % array.length;
  return array[index];
};

class DefaultConfig {
  getOptions() {
    return {
      type: {
        describe: 'The type of content to generate',
        choices: ['still', 'gif', 'random'],
        default: 'random',
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
      baseEffects: {
        describe:
          'Which effects to apply as a base, and let others be randomly selected',
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
    };
  }

  getType({ type, GIF_STILL_RATE = 0.5 }) {
    return type !== 'random' ? type : randomly(GIF_STILL_RATE, 'gif', 'still');
  }

  getDefaultNum(type) {
    return type === 'gif'
      ? randomly(0.8, 1, 3)
      : randomly(0.5, randomly(0.5, 3, 5), 1);
  }

  getNum({ type, num }) {
    return Number.isFinite(num) ? num : this.getDefaultNum(type);
  }

  async generateConfig(args) {
    const {
      caption,
      overlay,
      faceoverlay,
      effects,
      baseEffects,
      captionStart,
      captionEnd,
      captionText,
      tags,
      video,
      morphFile,
      MAX_NUM_EFFECTS,
      GIF_EFFECT_RATE,
      CAPTION_EFFECT_RATE,
      FIERIFICTION_VIDEO_RATE,
      MAX_FACE_OVERLAYS,
    } = args;
    const type = this.getType(args);
    const num = this.getNum(args);

    const maxNumEffects = MAX_NUM_EFFECTS ? parseInt(MAX_NUM_EFFECTS, 10) : 1;
    const CAPTION_RATE =
      caption || (captionText && captionText.length > 0) ? 1 : 0.9;
    const USE_GIF_EFFECT_RATE = GIF_EFFECT_RATE
      ? parseFloat(GIF_EFFECT_RATE)
      : 0.2;
    const USE_CAPTION_EFFECT_RATE = CAPTION_EFFECT_RATE
      ? parseFloat(CAPTION_EFFECT_RATE)
      : 0;
    const NUM_FIERIFICTION_VIDEO_RATE = FIERIFICTION_VIDEO_RATE
      ? parseFloat(FIERIFICTION_VIDEO_RATE)
      : 0;
    const NUM_MAX_FACE_OVERLAYS = MAX_FACE_OVERLAYS
      ? parseInt(MAX_FACE_OVERLAYS, 10)
      : 1;

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
    ].filter((o) =>
      overlay ? o.overlayFile.startsWith(`./overlays/${overlay}`) : true
    );

    const faceOverlayFiles = sync(`./faceoverlays/t*.png`);
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
      new stills.filters.ColorTone(),
      new stills.filters.Halo(),
      new stills.filters.Mirror(),
      new stills.filters.Overlay(overlayOptions),
      new stills.filters.FaceOverlay({
        overlayFile: faceOverlayFile,
        scale: 2,
      }),
      new stills.filters.Backdrop(),
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
      new stills.filters.Tint({
        factor: 1.7,
      }),
      new stills.filters.Invert(),
      new stills.filters.Reverse(),
      new stills.filters.Implode(),
      new stills.filters.Swirl(),
      new stills.filters.Rotate({
        useProgress: false,
        degrees: 15,
      }),
      new stills.filters.Flip(),
      new stills.filters.Flop(),
      new stills.filters.Jitter(),
      new stills.filters.FaceStretch({
        useProgress: true,
        randomOffset: 0,
      }),
      new stills.filters.Tempo(),
      new stills.filters.FewFrames(),
      new stills.filters.Pip(),
      new stills.filters.Flash(),
      new stills.filters.Station(),
      new stills.filters.BlendSelf(),
      new stills.filters.Blend({
        opacity: 0.5,
        overlayFile: sample(blendFiles),
      }),
      new stills.filters.SkipFrames(),
      new stills.filters.Boomerang(),
      new stills.filters.Delay({
        delay: random(500, 1000),
      }),
      new stills.filters.RepeatFrame({
        delay: 0,
      }),
      new stills.filters.FaceSwirl(),
      new stills.filters.Morph({
        morphFile,
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

    let useBaseEffects = baseEffects
      ? getEffectsByName(allEffects, baseEffects)
      : [];

    const filters = compact([
      ...useEffects,
      ...useBaseEffects,
      new stills.filters.Captions({
        folder: resolve('./captions'),
        font: resolve('./fonts/arial.ttf'),
        glyphs: false,
      }),
    ]);

    const singleCaptionEffects = ['fewframes', 'tempo', 'jitter'];

    const useSingleCaption =
      (Number.isFinite(num) && num > 1) ||
      intersection(singleCaptionEffects, map(useEffects, 'name')).length > 0;

    const globalsCaption = randomly(
      CAPTION_RATE,
      new stills.globals.Captions({
        captionFileGlob: caption ? `*${caption}*` : undefined,
        folder: resolve('./captions'),
        captionStart,
        captionEnd,
        captionText,
        pdfSentenceMaxLength: 50,
        transformationRate: USE_CAPTION_EFFECT_RATE,
        num: {
          srt: useSingleCaption ? 1 : random(1, 2),
          txt: 1,
          pdf: useSingleCaption ? 1 : random(1, 2),
        },
      })
    );

    const globals = compact([globalsCaption]);
    const isCreateFiction =
      video || Math.random() < NUM_FIERIFICTION_VIDEO_RATE;

    return {
      type,
      tags,
      num,
      globals,
      filters,
      isCreateFiction,
    };
  }
}

module.exports = DefaultConfig;
