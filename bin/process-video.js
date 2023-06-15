const stills = require('stills');
const { resolve } = require('path');

const sourceFilter = 'S34E01';
const sourceSeconds = '00:01:30';
const sourceEnd = '00:04:30';
const fps = 20;
const width = 1920;
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
    filters: [
      new stills.filters.Arcana({ useClassic: false, isSaveSync: true }),
    ],
  });
  await stillsInstance.smartSetup({
    enableValidator: true,
    validatorOptions: {
      isMatchReplaceSize: false,
      autoRepairMaxDeletion: 0.9,
      replaceFrames: { 
        file: resolve('../frames/mirror-very-long-2.mov'),
        seconds: '00:00:00',
        secondsApart: 1 / fps,
      },
    },
    framesOptions: { width, fps },
  });

  await stillsInstance.applyFrameFilters();
  await stillsInstance.collapse();
  console.log(`✨ Done.`);
};

(async () => {
  await processVideo();
  process.exit(0);
})();
