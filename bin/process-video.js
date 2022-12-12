const stills = require('stills');
const { resolve } = require('path');

const sourceFilter = 'S32E07';
const sourceSeconds = '11:45';
const sourceEnd = '13:55';
const fps = 1;
const width = 1280;
const startFrame = 0;

const processVideo = async () => {
  const stillsInstance = new stills.Stills({
    startFrame,
    source: new stills.sources.Local({
      folder: resolve('../videos'),
      outputFolder: resolve('../'),
      filter: (file) => file.indexOf(sourceFilter) !== -1,
    }),
    content: new stills.content.Video({
      seconds: sourceSeconds,
      secondsEnd: sourceEnd,
    }),
    filters: [new stills.filters.Arcana({ isMesh: false })],
  });
  await stillsInstance.smartSetup({
    enableValidator: false,
    validatorOptions: {
      autoRepairMaxDeletion: 0.9,
      replaceFrames: {
        file: resolve('../frames/video.mp4'),
        seconds: '01:40:00',
        secondsApart: 1 / fps,
      },
    },
    framesOptions: { width, fps },
  });

  await stillsInstance.applyFrameFilters();
  await stillsInstance.collapse();
};

(async () => {
  await processVideo();
})();
