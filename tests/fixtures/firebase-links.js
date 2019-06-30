const Chance = require('chance');
const _ = require('lodash');

const chance = new Chance();

function getRecord(overrides) {
  const newObj = _.cloneDeep(overrides || {});

  return _.defaults(newObj, {
    previewLinks: chance.url(),
    shortLink: chance.url(),
  });
}

module.exports = {
  getRecord,
};
