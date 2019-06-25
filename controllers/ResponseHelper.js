/* eslint-disable no-param-reassign */
const ResponseHelper = {
  async json(status, responseObject, message, data) {
    if (!status) status = 200;
    if (!data) data = null;
    if (!message) message = 'Data returned';
    if (!responseObject) throw new Error('Response object must be provided');
    return responseObject.status(status).send({
      message,
      data,
    });
  },

  async error(err, responseObject) {
    return responseObject.status(500).send({
      message: 'An error occurred',
      error: err,
    });
  },
};

module.exports = ResponseHelper;
