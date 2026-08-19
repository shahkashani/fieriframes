const stills = require('stills');

module.exports = () => ({
  grayscale: () => new stills.filters.Grayscale({ contrast: 1.2 }),
  reverse: () => new stills.filters.Reverse(),
  reverseScene: () => new stills.filters.ReverseScene(),
  jitter: () => new stills.filters.Jitter(),
  trails: () => new stills.filters.Trails(),
  station: () => new stills.filters.Station(),
  artattack: () => new stills.filters.ArtAttack({
    query: ['horse', 'food', 'party', 'art', 'death', 'crazy', 'wild'],
    medium: 'Paintings'
  }),
  filmgrab: (args = {}) =>
    new stills.filters.FilmGrab({
      category: args.filmCategory || 'noir'
    }),
  clips: (config) =>
    new stills.filters.Clips({
      source: new stills.sources.S3({
        accessKeyId: config.S3_ACCESS_KEY_ID,
        secretAccessKey: config.S3_SECRET_ACCESS_KEY,
        region: config.S3_REGION,
        bucket: config.CLIPS_S3_BUCKET,
      }),
    }),
  clipsOverlay: (config) =>
    new stills.filters.ClipsOverlay({
      source: new stills.sources.S3({
        accessKeyId: config.S3_ACCESS_KEY_ID,
        secretAccessKey: config.S3_SECRET_ACCESS_KEY,
        region: config.S3_REGION,
        bucket: config.CLIPS_S3_BUCKET,
      }),
    }),
});
