const User = require('../models/User');
const Team = require('../models/Team');
const Fixture = require('../models/Fixture');
/**
 * @param {string} text
 * @returns {object} return all
 */

// user promise
class UserPromise {
  static find(param) {
    return new Promise((resolve, reject) => {
      User.find(param).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  static create(param) {
    return new Promise((resolve, reject) => {
      User.create(param)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  static findOne(param) {
    return new Promise((resolve, reject) => {
      User.findOne(param).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * @param {string} param
   * @param {string} text
   * @return {object} returns updated object
   */
  static findOneAndUpdate(param, text) {
    return new Promise((resolve, reject) => {
      User.findOneAndUpdate(param, text, { new: true }).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  static findOneAndDelete(param) {
    return new Promise((resolve, reject) => {
      User.findOneAndDelete(param).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      });
    });
  }
}

// team promise
class TeamPromise {
  static find(param) {
    return new Promise((resolve, reject) => {
      Team.find(param).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  static create(param) {
    return new Promise((resolve, reject) => {
      Team.create(param)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  static findOne(param) {
    return new Promise((resolve, reject) => {
      Team.findOne(param).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * @param {string} param
   * @param {string} text
   * @return {object} returns updated object
   */
  static findOneAndUpdate(param, text) {
    return new Promise((resolve, reject) => {
      Team.findOneAndUpdate(param, text, { new: true }).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  static findOneAndDelete(param) {
    return new Promise((resolve, reject) => {
      Team.findOneAndDelete(param).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  static delete(param) {
    return new Promise((resolve, reject) => {
      Team.deleteMany(param).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      });
    });
  }
}

// fixture promise
class FixturePromise {
  static find(param) {
    return new Promise((resolve, reject) => {
      Fixture.find(param).populate(['homeTeam', 'awayTeam']).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  static create(param) {
    return new Promise((resolve, reject) => {
      Fixture.create(param)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  static findOne(param) {
    return new Promise((resolve, reject) => {
      Fixture.findOne(param).populate(['homeTeam', 'awayTeam']).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   * @param {string} param
   * @param {string} text
   * @return {object} returns updated object
   */
  static findOneAndUpdate(param, text) {
    return new Promise((resolve, reject) => {
      Fixture.findOneAndUpdate(param, text, { new: true }).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  static findOneAndDelete(param) {
    return new Promise((resolve, reject) => {
      Fixture.findOneAndDelete(param).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  static delete(param) {
    return new Promise((resolve, reject) => {
      Fixture.deleteMany(param).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      });
    });
  }
}

module.exports = {
  UserPromise,
  TeamPromise,
  FixturePromise,
};
