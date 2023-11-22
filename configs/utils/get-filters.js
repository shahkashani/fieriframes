const stills = require('stills');

module.exports = () => ({
  grayscale: () => new stills.filters.Grayscale(),
  reverse: () => new stills.filters.Reverse(),
  jitter: () => new stills.filters.Jitter(),
  trails: () => new stills.filters.Trails(),
});
