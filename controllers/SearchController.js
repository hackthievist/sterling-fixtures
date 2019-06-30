const ResponseHelper = require('./ResponseHelper');
const ElasticService = require('../services/ElasticService');

const Search = {
  async search(req, res) {
    try {
      const data = req.body;
      const search = {
        min_score: 0.2,
        query: {
          bool: {
            should: [

            ],
          },
        },
      };

      const slugSearch = {
        match: {
          slug: data.slug,
        },
      };

      const nameSearch = {
        match: {
          name: data.name,
        },
      };

      const fixtureSlugSearch = {
        match: {
          fixtureSlug: data.fixtureSlug,
        },
      };

      if (data.type === 'fixture' && data.fixtureSlug) {
        search.query.bool.should.push(fixtureSlugSearch);
      }

      if (data.type === 'team' && data.slug) {
        search.query.bool.should.push(slugSearch);
      }

      if (data.type === 'team' && data.name) {
        search.query.bool.should.push(nameSearch);
      }
      const results = await ElasticService.search(req.body.index, req.body.type, search);
      const searchResults = await results.hits.hits.map(each => each._source);
      return ResponseHelper.json(200, res, 'Results retrieved successfully', searchResults);
    } catch (err) {
      return ResponseHelper.error(err, res);
    }
  },
};

module.exports = Search;
