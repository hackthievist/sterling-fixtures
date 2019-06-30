const Chance = require('chance');
const _ = require('lodash');

const chance = new Chance();

function getRecord(overrides) {
  const newObj = _.cloneDeep(overrides || {});

  return _.defaults(newObj, {
    name: chance.name(),
    userName: chance.word({ length: 20 }),
    password: chance.string(),
    email: chance.email(),
    role: chance.pickone(['admin', 'user']),
    isDeleted: false,
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
