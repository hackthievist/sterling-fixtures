const Chance = require('chance');
const _ = require('lodash');

const chance = new Chance();

function getRecord(overrides) {
  const newObj = _.cloneDeep(overrides || {});

  return _.defaults(newObj, {
    homeTeam: chance.string({ pool: 'abcdefghijklmnopqrstuvwxyz', length: 12 }),
    awayTeam: chance.string({ pool: 'abcdefghijklmnopqrstuvwxyz', length: 12 }),
    fixtureSlug: chance.string({ length: 6, pool: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' }),
    status: chance.pickone(['pending', 'ongoing', 'cancelled', 'completed']),
    startDate: chance.date(),
    endDate: chance.date(),
    url: chance.url(),
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
