const jwt = require('jsonwebtoken');
const jwtConfig = require('../../config').jwt;

function getToken(user) {
  const token = jwt.sign({ data: user }, jwtConfig.secret, { expiresIn: jwtConfig.exp });
  return token;
}

module.exports = {
  getToken,
};
