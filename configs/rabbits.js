const stills = require('stills');

class RabbitsConfig {
  async generateConfig({
    S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY,
    S3_REGION,
    CLIPS_S3_BUCKET,
  }) {
    return {
      type: 'gif',
      tags: ['🐰'],
      caption: new stills.captions.Quotes({
        folder: './captions/other/shows/rabbits',
        num: 1,
      }),
      filters: [
        new stills.filters.Clips({
          fit: 'cover',
          source: new stills.sources.S3({
            accessKeyId: S3_ACCESS_KEY_ID,
            secretAccessKey: S3_SECRET_ACCESS_KEY,
            region: S3_REGION,
            bucket: CLIPS_S3_BUCKET,
          }),
        }),
      ],
    };
  }
}

module.exports = RabbitsConfig;
