const ResponseHelper = require('./ResponseHelper');
const ElasticService = require('../services/ElasticService');

const Search = {
  async search(req, res) {
    try {
      const results = await ElasticService.search(req.body.index, req.body.type, req.body.search);
      const searchResults = await results.hits.hits.map(each => each._source);
      return ResponseHelper.json(200, res, 'Results retrieved successfully', searchResults);
    } catch (err) {
      return ResponseHelper.error(err, res);
    }
  },
};

module.exports = Search;
