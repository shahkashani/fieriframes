require('dotenv').config();
require('./logo');

const yargs = require('yargs');
const stills = require('stills');
const { compact, flatten, get } = require('lodash');
const FieriFiction = require('fierifiction');

const configs = {
  default: require('./configs/default'),
  clean: require('./configs/clean'),
  arcadia: require('./configs/arcadia'),
  arcana: require('./configs/arcana'),
  dreamers: require('./configs/dreamers'),
  birthday: require('./configs/birthday'),
  vday: require('./configs/vday'),
  twinpeaks: require('./configs/twinpeaks'),
  sauce: require('./configs/sauce'),
  cormorants: require('./configs/cormorants'),
};

const date = new Date().toLocaleString('en-US', {
  month: 'long',
  day: 'numeric',
  timeZone: 'America/New_York',
});

const events = {
  'January 22': 'birthday',
  'February 16': 'vday',
  'February 24': 'twinpeaks',
};

const defaultConfig = events[date] || 'default';

const DEFAULT_OPTIONS = {
  sourceSeconds: {
    describe: 'Where in the video to start creating the images from',
  },
  post: {
    describe: 'Post the generates images to the destination',
    boolean: true,
  },
  draft: {
    describe: 'Create as draft',
    boolean: true,
  },
  match: {
    describe: 'Match captions in static mode',
    boolean: true,
    default: true,
  },
  matchText: {
    describe: 'Match caption to this string instead of the caption',
  },
  smart: {
    describe: 'Use the smart setup',
    boolean: false,
  },
  prompt: {
    describe: 'Prompt before posting',
    boolean: true,
    default: false,
  },
  local: {
    describe: 'Local folder to read videos from',
  },
  sourceFilter: {
    describe: 'A glob for what video file to pick stills from',
  },
  sourceLength: {
    describe: 'How long GIFs should be',
    number: true,
  },
  secondsApart: {
    describe: 'How far multiple images should be separated apart',
    number: true,
  },
  outputFolder: {
    describe: 'Where to put the generated images',
    default: __dirname,
  },
  gifWidth: {
    describe: 'Width of GIFs',
    default: 720,
  },
  descriptionText: {
    describe: 'Description text to use',
  },
  config: {
    describe: 'What config template to use',
    choices: Object.keys(configs),
    default: defaultConfig,
  },
};

const getSourceSeconds = (string) => {
  if (!string) {
    return undefined;
  }
  if (string.toString().indexOf(':') !== -1) {
    const [m, s] = string.split(':');
    return parseFloat(m) * 60 + parseFloat(s);
  }
  return parseFloat(string);
};

(async () => {
  const { config } = yargs.options(DEFAULT_OPTIONS).help(false).argv;
  const useConfig = new configs[config]();
  const configOptions = useConfig.getOptions ? useConfig.getOptions() : {};

  const args = yargs
    .options({
      ...DEFAULT_OPTIONS,
      ...configOptions,
    })
    .help(true).argv;

  const options = { ...args, ...process.env };
  options.sourceSeconds = options.sourceSeconds
    ? getSourceSeconds(options.sourceSeconds)
    : null;

  const allConfigs = await useConfig.generateConfig(options);
  const baseConfigs = Array.isArray(allConfigs) ? allConfigs : [allConfigs];

  for (const baseConfig of baseConfigs) {
    const {
      type,
      num,
      tags,
      filterCaption,
      highlightColor,
      isCreateFiction,
      blogName,
      isDraft,
      ask,
      validators,
    } = baseConfig;

    const {
      post,
      prompt,
      local,
      sourceFilter,
      sourceLength,
      sourceSeconds,
      outputFolder,
      secondsApart,
      gifWidth,
      draft,
      smart,
      descriptionText,
      TUMBLR_CONSUMER_KEY,
      TUMBLR_CONSUMER_SECRET,
      TUMBLR_ACCESS_TOKEN_KEY,
      TUMBLR_ACCESS_TOKEN_SECRET,
      TUMBLR_BLOG_NAME,
      TUMBLR_REBLOG_BLOG_NAME,
      S3_ACCESS_KEY_ID,
      S3_SECRET_ACCESS_KEY,
      S3_BUCKET,
      S3_REGION,
      GIF_FPS,
      GIF_LENGTH_SECONDS,
      MICROSOFT_AZURE_TOKEN,
      MICROSOFT_AZURE_URL,
      POST_TEXT_GENERATOR_URL,
      POST_TEXT_GENERATOR_API_KEY,
      POST_TEXT_GENERATOR_LENGTH,
      SPOTIFY_CLIENT_ID,
      SPOTIFY_CLIENT_SECRET,
      MICROSOFT_COGNITIVE_TOKEN,
      MICROSOFT_COGNITIVE_URL,
      MICROSOFT_AZURE_SPEECH_TOKEN,
      MICROSOFT_AZURE_SPEECH_REGION,
      BANNED_WORDS,
      ALLOWED_WORDS,
      VIDEO_MUSIC_PREFIX,
      VOICE_RATE,
      VOICE_STYLE,
      VOICE_GENDER,
      VOICE_PITCH,
      VOICE_CONTOUR,
      VOICE_COUNT,
    } = options;

    const NUM_GIF_LENGTH_SECONDS = GIF_LENGTH_SECONDS
      ? parseFloat(GIF_LENGTH_SECONDS)
      : 2;
    const NUM_GIF_FPS = GIF_FPS ? parseInt(GIF_FPS) : 12;
    const postDraft = draft || isDraft;
    const postBlogName = blogName || TUMBLR_BLOG_NAME;
    const NUM_POST_GENERATOR_LENGTH = POST_TEXT_GENERATOR_LENGTH
      ? parseInt(POST_TEXT_GENERATOR_LENGTH)
      : 100;

    const TUMBLR_CONFIG = {
      highlightColor,
      ask,
      consumerKey: TUMBLR_CONSUMER_KEY,
      consumerSecret: TUMBLR_CONSUMER_SECRET,
      token: TUMBLR_ACCESS_TOKEN_KEY,
      tokenSecret: TUMBLR_ACCESS_TOKEN_SECRET,
      blogName: postBlogName,
      publishState: postDraft ? 'draft' : undefined,
    };

    const useSourceFilter = sourceFilter || baseConfig.sourceFilter;

    const destinations = post
      ? [new stills.destinations.Tumblr(TUMBLR_CONFIG)]
      : [];

    const source = local
      ? new stills.sources.Local({
          folder: local,
          filter: sourceFilter
            ? (file) =>
                file.toLowerCase().indexOf(useSourceFilter.toLowerCase()) !== -1
            : null,
          outputFolder,
        })
      : new stills.sources.S3({
          accessKeyId: S3_ACCESS_KEY_ID,
          secretAccessKey: S3_SECRET_ACCESS_KEY,
          region: S3_REGION,
          bucket: S3_BUCKET,
          filter: (file) =>
            !useSourceFilter
              ? true
              : file.Key.toLowerCase().indexOf(
                  useSourceFilter.toLowerCase()
                ) !== -1,
        });

    const taggers = [
      new stills.taggers.Episode(),
      new stills.taggers.Static({
        tags: compact([
          'guy fieri',
          'guyfieri',
          'diners drive-ins and dives',
          ...(tags || []),
        ]),
      }),
      new stills.taggers.Filters({
        shuffle: 'tw:flashing',
        stutter: 'tw:flashing',
        jitter: 'tw:flashing',
        flash: 'tw:flashing',
        tile: 'tw:flashing',
        fewframes: 'tw:flashing',
        repeatframe: 'tw:flashing',
        blink: 'tw:flashing',
        arcadia: 'et in arcadia ego',
      }),
    ];

    if (MICROSOFT_COGNITIVE_URL && MICROSOFT_COGNITIVE_TOKEN) {
      taggers.push(
        new stills.taggers.Captions({
          url: MICROSOFT_COGNITIVE_URL,
          token: MICROSOFT_COGNITIVE_TOKEN,
        })
      );
    }

    const useDescription = descriptionText || baseConfig.descriptionText;
    const description = useDescription
      ? new stills.descriptions.Static({ description: useDescription })
      : new stills.descriptions.Captions();
    const analysis =
      destinations.length > 0 && MICROSOFT_AZURE_TOKEN && MICROSOFT_AZURE_URL
        ? new stills.analysis.Azure({
            token: MICROSOFT_AZURE_TOKEN,
            url: MICROSOFT_AZURE_URL,
          })
        : null;

    const contents = {
      gif: new stills.content.Gif({
        secondsApart,
        width: gifWidth,
        seconds: sourceSeconds,
        duration: Number.isFinite(sourceLength)
          ? sourceLength
          : NUM_GIF_LENGTH_SECONDS,
        fps: NUM_GIF_FPS,
      }),
      still: new stills.content.Still({
        secondsApart,
        seconds: sourceSeconds,
      }),
    };

    const content = contents[type];
    const baseConfigData = baseConfig.data || {};

    const moderation = new stills.moderation.Words({
      bannedWords: (BANNED_WORDS || '').split(','),
      allowedWords: (ALLOWED_WORDS || '').split(','),
    });

    const finalConfig = {
      ...baseConfig,
      num,
      analysis,
      destinations,
      description,
      taggers,
      source,
      content,
      validators,
      moderation,
      filterCaption: filterCaption || new stills.filters.captions.Simple(),
      isPrompt: prompt,
    };

    console.log(`⚙️  ${date} config: ${config}`);
    console.log(`🎨 Making ${num || 1}x images.`);
    console.log(`🏃 Running in ${local ? 'local' : 'S3'} mode`);
    console.log(
      `📮 ${destinations.length > 0 ? 'Posting' : 'Not posting'}${
        postDraft ? ' draft' : ''
      } to ${postBlogName}`
    );
    if (ask) {
      console.log(`💌 Responding to an ask by ${ask.asking_name}`);
    }
    const isSmart = (smart || finalConfig.isSmart) && type !== 'still';
    const stillsInstance = new stills.Stills(finalConfig);
    const result = await stillsInstance.generate({
      isSmart,
    });

    if (useConfig.onComplete) {
      await useConfig.onComplete(result, baseConfigData);
    }

    if (isCreateFiction && result.destinations && result.destinations.tumblr) {
      let captions = flatten(get(result, 'captions', []));
      const { text } = result.destinations.tumblr;
      // Bad workaround for passthroughs currently not populating globals
      if (captions.length === 0 && text) {
        captions = Array.from(text.matchAll(/Caption: (.*)]/g)).map(
          (m) => m[1]
        );
      }
      if (captions.length > 0) {
        const fierifiction = new FieriFiction({
          tumblrConsumerKey: TUMBLR_CONSUMER_KEY,
          tumblrConsumerSecret: TUMBLR_CONSUMER_SECRET,
          tumblrTokenKey: TUMBLR_ACCESS_TOKEN_KEY,
          tumblrTokenSecret: TUMBLR_ACCESS_TOKEN_SECRET,
          tumblrBlogName: TUMBLR_REBLOG_BLOG_NAME,
          textGeneratorUrl: POST_TEXT_GENERATOR_URL,
          textGeneratorApiKey: POST_TEXT_GENERATOR_API_KEY,
          spotifyClientId: SPOTIFY_CLIENT_ID,
          spotifyClientSecret: SPOTIFY_CLIENT_SECRET,
          textLength: NUM_POST_GENERATOR_LENGTH,
          microsoftAzureSpeechToken: MICROSOFT_AZURE_SPEECH_TOKEN,
          microsoftAzureSpeechRegion: MICROSOFT_AZURE_SPEECH_REGION,
          moderation: new stills.moderation.Words({
            bannedWords: (BANNED_WORDS || '').split(','),
            allowedWords: (ALLOWED_WORDS || '').split(','),
          }),
          songPrefix: VIDEO_MUSIC_PREFIX,
          voices: VOICE_COUNT ? parseInt(VOICE_COUNT, 10) : 1,
          voiceRate: VOICE_RATE,
          voiceStyle: VOICE_STYLE,
          voiceGender: VOICE_GENDER,
          voicePitch: VOICE_PITCH,
          voiceContour: VOICE_CONTOUR,
        });

        await fierifiction.postVideo(
          result.content.map((c) => c.file),
          captions,
          result.tags,
          result.destinations.tumblr.url,
          postDraft ? 'draft' : undefined
        );
      }
    }

    if (destinations.length > 0) {
      stillsInstance.deleteStills();
    }
  }

  process.exit(0);
})();
