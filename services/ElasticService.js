/* eslint-disable no-param-reassign */
const elasticsearch = require('elasticsearch');
const _ = require('lodash');

const host = process.env.ES_HOST;

const client = new elasticsearch.Client({
  host,
});
const Promise = require('bluebird');

module.exports = {
  search(indexName, indexType, query, parent, cb) {
    return new Promise(((resolve, reject) => {
      const params = {
        index: indexName,
        body: query,
      };
      if (indexType && indexType !== 'all') {
        params.type = indexType;
      }
      client.search(params).then((body) => {
        if (typeof cb === 'function') {
          return cb(null, body);
        }
        return resolve(body);
      }, (error) => {
        /* istanbul ignore next */
        if (typeof cb === 'function') {
          return cb(error, null);
        }
        return reject(error);
      });
    }));
  },

  async cleanData(payload, reqData) {
    if (payload._id) {
      const cleanedData = _.pick(payload, reqData);
      cleanedData.id = JSON.stringify(payload._id);
      return cleanedData;
    }
    return payload;
  },

  async addObject(indexName, indexType, payload, reqData) {
    try {
      const data = await this.cleanData(payload, reqData);
      const params = {
        index: indexName,
        type: indexType,
        id: data.id,
        body: data,
      };
      await client.create(params);
    } catch (error) {
      throw new Error(error);
    }
  },

  async updateObject(indexName, indexType, payload, reqData) {
    try {
      const data = await this.cleanData(payload, reqData);
      const params = {
        index: indexName,
        type: indexType,
        id: data.id,
        body: {
          doc: data,
        },
      };
      await client.update(params);
    } catch (error) {
      throw new Error(error);
    }
  },

  async deleteObject(indexName, indexType, objectId) {
    try {
      const params = {
        index: indexName,
        type: indexType,
        id: JSON.stringify(objectId),
      };
      await client.delete(params);
    } catch (error) {
      throw new Error(error);
    }
  },
};
