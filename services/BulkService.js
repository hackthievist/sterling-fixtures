/* eslint-disable no-restricted-syntax */
const fetch = require('node-fetch');
const config = require('../config');

module.exports = {
  async create(data, req, model) {
    const result = {
      success: [],
      failed: [],
    };
    for (const item of data) {
      const bulkData = await fetch(`${config.settings.baseUrl}/${model}`, {
        method: 'POST',
        body: JSON.stringify(item),
        headers: {
          Authorization: req.headers.authorization,
          'Content-Type': 'application/json',
        },
      });
      const json = await bulkData.json();
      if (!json.data) {
        item.error = true;
        item.errorMessage = json;
        result.failed.push(item);
      } else {
        try {
          result.success.push(json.data);
        } catch (err) {
          item.error = true;
          item.errorMessage = json;
          result.failed.push(item);
        }
      }
    }
    return result;
  },

};
