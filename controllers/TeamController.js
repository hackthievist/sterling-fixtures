const config = require('../config');
const cache = require('express-redis-cache')(config.redis);
const _ = require('lodash');
const Team = require('./promise').TeamPromise;
const ResponseHelper = require('./ResponseHelper');
const ElasticService = require('../services/ElasticService');
const helpers = require('../helpers');

const elasticIndex = `${config.elastic.ES_INDEX_PREFIX}-team`;

const TeamController = {
  async create(req, res) {
    try {
      const data = req.body;
      if (!data.name) return ResponseHelper.json(400, res, 'Team name is required');
      if (!data.slug) data.slug = helpers.cleanSlug(_.pick(data, ['name', 'slug']));
      const team = await Team.create(data);
      await ElasticService.addObject(elasticIndex, 'team', team, ['name', 'slug']);
      return ResponseHelper.json(201, res, 'Team created successfully', team);
    } catch (error) {
      return ResponseHelper.error(error, res);
    }
  },

  async read(req, res) {
    try {
      cache.route();
      const teamId = req.params.id;
      const queryData = { _id: teamId, isDeleted: false };
      const team = await Team.findOne(queryData);
      if (!team) return ResponseHelper.json(404, res, 'Team not found');
      return ResponseHelper.json(200, res, 'Team successfully retrieved', team);
    } catch (err) {
      return ResponseHelper.error(err, res);
    }
  },

  async list(req, res) {
    try {
      cache.route();
      const queryData = { isDeleted: false };
      const teams = await Team.find(queryData);
      if (teams.length === 0) return ResponseHelper.json(200, res, 'No teams found', teams);
      return ResponseHelper.json(200, res, 'Teams successfully retrieved', teams);
    } catch (err) {
      return ResponseHelper.error(err, res);
    }
  },

  async update(req, res) {
    try {
      const teamId = req.params.id;
      const queryData = { _id: teamId, isDeleted: false };
      const updateData = req.body;
      const team = await Team.findOneAndUpdate(queryData, updateData);
      if (!team) return ResponseHelper.json(404, res, 'Team not found');
      await ElasticService.updateObject(elasticIndex, 'team', team, ['name', 'slug']);
      return ResponseHelper.json(200, res, 'Team successfully updated', team);
    } catch (err) {
      return ResponseHelper.error(err, res);
    }
  },

  async delete(req, res) {
    try {
      const teamId = req.params.id;
      const queryData = { _id: teamId, isDeleted: false };
      const foundTeam = await Team.findOne(queryData);
      if (!foundTeam) return ResponseHelper.json(404, res, 'Team not found');
      const updateData = { isDeleted: true };
      const team = await Team.findOneAndUpdate(queryData, updateData);
      await ElasticService.deleteObject(elasticIndex, 'team', team._id);
      return ResponseHelper.json(200, res, 'Team successfully deleted', team);
    } catch (err) {
      return ResponseHelper.error(err, res);
    }
  },
};

module.exports = TeamController;
