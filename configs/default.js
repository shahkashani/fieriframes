const stills = require('stills');
const { sample } = require('lodash');
const getFilters = require('./utils/get-filters');

const FILTERS = getFilters();

const randomly = (rate, hit = true, miss = false) =>
  Math.random() < rate ? hit : miss;

const getCaption = (
  captionText,
  captionType,
  num,
  lyricsConfig = {},
  sourceSeconds = null,
  matchText = null
) => {
  if (!captionType || captionType === 'none') {
    return null;
  }
  const types = {
    ddd: new stills.captions.Episodes({ num, sourceSeconds }),
    quotes: new stills.captions.Quotes({ num }),
    books: new stills.captions.Books({ num }),
    lyrics: new stills.captions.Lyrics({ num, ...lyricsConfig }),
    word: new stills.captions.Word(),
    static: new stills.captions.Static({
      captions: captionText,
    }),
    match: new stills.captions.StaticMatch({
      matchText,
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
        choices: ['ddd', 'quotes', 'books', 'match', 'lyrics', 'word', 'none'],
      },
      num: {
        describe: 'The number of images to generate',
      },
      video: {
        describe: 'Always post a fierifiction video',
        boolean: false,
      },
      filter: {
        describe: 'Filter to apply',
        array: true,
        default: [],
      },
      captionText: {
        describe: 'Custom captions to use',
        array: true,
      },
      tags: {
        describe: 'Additional tags to add',
        array: true,
        default: [],
      },
      face: {
        describe: 'Require a face',
        boolean: true,
      },
      glyphs: {
        describe: 'Use glyphs',
        boolean: false,
      },
      eyes: {
        describe: 'Require big eyes',
        boolean: true,
      },
      artist: {
        describe: 'For lyrics caption type',
      },
    };
  }

  getType({ type, GIF_STILL_RATE = 0.5 }) {
    return type !== 'random' ? type : randomly(GIF_STILL_RATE, 'gif', 'still');
  }

  getCaptionType(
    { captionType, artist, captionText, match },
    episodeCaptionRate
  ) {
    if (captionType) {
      return captionType;
    }
    if (artist) {
      return 'lyrics';
    }
    if (captionText) {
      return match ? 'match' : 'static';
    }
    return randomly(
      episodeCaptionRate,
      'ddd',
      sample(['quotes', 'books', 'lyrics', 'word'])
    );
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
      tags,
      video,
      face,
      eyes,
      glyphs,
      captionText,
      sourceSeconds,
      matchText,
      artist,
      filter: filterNames,
      FIERIFICTION_VIDEO_RATE,
      LYRICS_API_KEY,
      LYRICS_ARTISTS,
      EPISODE_CAPTION_RATE,
    } = args;

    const NUM_FIERIFICTION_VIDEO_RATE = FIERIFICTION_VIDEO_RATE
      ? parseFloat(FIERIFICTION_VIDEO_RATE)
      : 0;
    const USE_EPISODE_CAPTION_RATE = EPISODE_CAPTION_RATE
      ? parseFloat(EPISODE_CAPTION_RATE)
      : 0.9;

    const type = this.getType(args);
    const captionType = this.getCaptionType(args, USE_EPISODE_CAPTION_RATE);
    const num = this.getNum(args);
    const filterCaption = new stills.filters.captions.Simple({
      glyphs,
      font: glyphs ? './fonts/voynich.ttf' : './fonts/arial.ttf',
    });

    const isCreateFiction =
      video || Math.random() < NUM_FIERIFICTION_VIDEO_RATE;

    const validators = [];

    if (face) {
      validators.push(new stills.validators.FaceDetection());
    }

    if (eyes) {
      validators.push(new stills.validators.EyeDetection());
    }

    const caption = getCaption(
      captionText,
      captionType,
      num,
      {
        apikey: LYRICS_API_KEY,
        artist: artist || sample(LYRICS_ARTISTS.split(',')),
      },
      sourceSeconds,
      matchText
    );

    const filters = filterNames.reduce((memo, name) => {
      const filter = FILTERS[name];
      return filter ? [...memo, filter(args)] : memo;
    }, []);

    return {
      num,
      type,
      tags,
      filters,
      filterCaption,
      caption,
      validators,
      isCreateFiction,
    };
  }
}

module.exports = DefaultConfig;
