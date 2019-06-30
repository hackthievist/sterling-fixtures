const Chance = require('chance');
const _ = require('lodash');

const chance = new Chance();

function getRecord(overrides) {
  const newObj = _.cloneDeep(overrides || {});

  return _.defaults(newObj, {
    name: `${chance.word({ length: 5 })} ${chance.pickone(['FC', 'CF'])}`,
    slug: chance.string({ length: 3, pool: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' }),
  });
}

function getId() {
  const id = chance.integer({ min: 100000000000 });
  return id;
}

module.exports = {
  getRecord,
  getId,
};
