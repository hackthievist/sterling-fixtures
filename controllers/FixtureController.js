/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */
const _ = require('lodash');
const moment = require('moment')();
const config = require('../config');
const redisClient = require('redis').createClient({ url: config.redis.url });
const cache = require('express-redis-cache')({ client: redisClient });
const Team = require('./promise').TeamPromise;
const Fixture = require('./promise').FixturePromise;
const ResponseHelper = require('./ResponseHelper');
const FirebaseService = require('../services/FirebaseService');
const BulkService = require('../services/BulkService');
const ElasticService = require('../services/ElasticService');

const elasticIndex = `${config.elasticsearch.indexPrefix}-fixture`;

const FixtureController = {
  async create(req, res) {
    try {
      const data = req.body;
      if (Array.isArray(data)) {
        const response = await BulkService.create(data, req, 'fixture');
        if (response.failed.length && response.success.length) {
          return ResponseHelper.json(207, res, 'Some fixtures were successfully created', response);
        } if (!response.success.length && response.failed.length) {
          return ResponseHelper.json(400, res, 'Creation of fixtures failed', response);
        }
        return ResponseHelper.json(200, res, 'Fixtures created successfully', response);
      }
      if (!data.homeTeam || !data.awayTeam) return ResponseHelper.json(400, res, 'Please provide home and away teams');
      const homeTeam = await Team.findOne({ _id: data.homeTeam, isDeleted: false });
      const awayTeam = await Team.findOne({ _id: data.awayTeam, isDeleted: false });
      if (!homeTeam || !awayTeam) return ResponseHelper.json(400, res, 'Please provide valid home and away teams');
      if (_.isEqual(homeTeam, awayTeam)) return ResponseHelper.json(400, res, 'A team cannot play against itself');
      const fixtureExists = await Fixture.findOne({
        homeTeam: homeTeam._id, awayTeam: awayTeam._id, startDate: data.startDate, endDate: data.endDate, isDeleted: false,
      });
      if (fixtureExists) return ResponseHelper.json(400, res, 'Duplicate Fixture', fixtureExists);
      if (!data.endDate || !data.startDate) return ResponseHelper.json(400, res, 'Provide valid start and end dates');
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      const currentDate = new Date();
      if (endDate - startDate < 0) return ResponseHelper.json(400, res, 'The end date has to be later than the start date');
      if (startDate - currentDate < 0 || endDate - currentDate < 0) return ResponseHelper.json(400, res, 'The start and end dates have to be in the future');
      if (!data.fixtureSlug) data.fixtureSlug = `${homeTeam.slug}${awayTeam.slug}`;
      const gameDate = moment.format(data.startDate);
      const urlSlug = `${config.settings.baseUrl}/fixture?details=fixtureSlug=${data.fixtureSlug},startDate=${gameDate}`;
      data.url = await FirebaseService.getShortLink(urlSlug);
      const fixture = await Fixture.create(data);
      await ElasticService.addObject(elasticIndex, 'fixture', fixture, ['homeTeam', 'awayTeam', 'status', 'startDate', 'endDate', 'fixtureSlug', 'isDeleted']);
      const foundFixture = await Fixture.findOne({ _id: fixture._id, isDeleted: false });
      return ResponseHelper.json(201, res, 'Fixture created successfully', foundFixture);
    } catch (error) {
      return ResponseHelper.error(error, res);
    }
  },

  async read(req, res) {
    try {
      cache.route();
      const fixtureId = req.params.id;
      let queryData;
      let fixture;
      if (req.query.details) {
        const queryString = req.query;
        const splitQuery = queryString.details.split(',');
        queryData = splitQuery.reduce((stringObject, string) => {
          const obj = string.split('=');
          stringObject[obj[0]] = obj[1];
          return stringObject;
        }, {});
        fixture = await Fixture.findOne(queryData);
        if (!fixture) return ResponseHelper.json(404, res, 'Fixture not found');
        return ResponseHelper.json(200, res, 'Fixture successfully retrieved', fixture);
      }
      queryData = { _id: fixtureId, isDeleted: false };
      fixture = await Fixture.findOne(queryData);
      if (!fixture) return ResponseHelper.json(404, res, 'Fixture not found');
      return ResponseHelper.json(200, res, 'Fixture successfully retrieved', fixture);
    } catch (err) {
      return ResponseHelper.error(err, res);
    }
  },

  async getFixtures(req, res) {
    try {
      cache.route();
      const { status } = req.query;
      const queryData = { isDeleted: false };
      if (status) queryData.status = status;
      const fixtures = await Fixture.find(queryData);
      if (!fixtures.length) return ResponseHelper.json(404, res, 'There are no fixtures', fixtures);
      return ResponseHelper.json(200, res, 'Fixtures successfully retrieved', fixtures);
    } catch (err) {
      return ResponseHelper.error(err, res);
    }
  },

  async update(req, res) {
    try {
      const fixtureId = req.params.id;
      const queryData = { _id: fixtureId, isDeleted: false };
      const updateData = req.body;
      const foundFixture = await Fixture.findOne(queryData);
      if (!foundFixture) return ResponseHelper.json(404, res, 'Fixture not found');
      const gameScore = foundFixture.gameScore;
      const splitScore = gameScore.split('-');
      splitScore[0] = _.has(updateData, 'homeTeamScore') ? updateData.homeTeamScore : splitScore[0];
      splitScore[1] = _.has(updateData, 'awayTeamScore') ? updateData.awayTeamScore : splitScore[1];
      if (!updateData.gameScore) updateData.gameScore = splitScore.join('-');
      const fixture = await Fixture.findOneAndUpdate(queryData, updateData);
      await ElasticService.updateObject(elasticIndex, 'fixture', fixture, ['homeTeam', 'awayTeam', 'status', 'startDate', 'endDate', 'fixtureSlug', 'isDeleted']);
      return ResponseHelper.json(200, res, 'Fixture successfully updated', fixture);
    } catch (err) {
      return ResponseHelper.error(err, res);
    }
  },

  async cancel(req, res) {
    try {
      const fixtureId = req.params.id;
      const queryData = { _id: fixtureId, isDeleted: false };
      const foundFixture = await Fixture.findOne(queryData);
      if (!foundFixture) return ResponseHelper.json(404, res, 'Fixture not found');
      if (foundFixture.status === 'cancelled') return ResponseHelper.json(400, res, 'Match has been previously cancelled', foundFixture);
      const updateData = { status: 'cancelled' };
      const fixture = await Fixture.findOneAndUpdate(queryData, updateData);
      await ElasticService.updateObject(elasticIndex, 'fixture', fixture, ['homeTeam', 'awayTeam', 'status', 'startDate', 'endDate', 'fixtureSlug', 'isDeleted']);
      return ResponseHelper.json(200, res, 'Fixture successfully cancelled', fixture);
    } catch (err) {
      return ResponseHelper.error(err, res);
    }
  },

  async postpone(req, res) {
    try {
      const fixtureId = req.params.id;
      const queryData = { _id: fixtureId, isDeleted: false };
      const foundFixture = await Fixture.findOne(queryData);
      const updateData = _.pick(req.body, ['startDate', 'endDate']);
      if (!foundFixture) return ResponseHelper.json(404, res, 'Fixture not found');
      if (!_.has(updateData, 'startDate')) updateData.startDate = foundFixture.startDate;
      if (!_.has(updateData, 'endDate')) updateData.endDate = foundFixture.endDate;
      const startDate = new Date(updateData.startDate);
      const endDate = new Date(updateData.endDate);
      const currentDate = new Date();
      if (startDate - currentDate < 0 || endDate - currentDate < 0) return ResponseHelper.json(400, res, 'The postponed dates have to be in the future');
      if (endDate - startDate < 0) return ResponseHelper.json(400, res, 'The end date has to be later than the start date');
      if (foundFixture.status === 'completed') return ResponseHelper.json(400, res, 'Completed matches cannot be postponed');
      updateData.status = 'pending';
      const fixture = await Fixture.findOneAndUpdate(queryData, updateData);
      await ElasticService.updateObject(elasticIndex, 'fixture', fixture, ['homeTeam', 'awayTeam', 'status', 'startDate', 'endDate', 'fixtureSlug', 'isDeleted']);
      return ResponseHelper.json(200, res, 'Fixture successfully postponed', fixture);
    } catch (err) {
      return ResponseHelper.error(err, res);
    }
  },

  async delete(req, res) {
    try {
      const fixtureId = req.params.id;
      const queryData = { _id: fixtureId, isDeleted: false };
      const foundFixture = await Fixture.findOne(queryData);
      if (!foundFixture) return ResponseHelper.json(404, res, 'Fixture not found');
      const updateData = { isDeleted: true, deletedAt: new Date() };
      const fixture = await Fixture.findOneAndUpdate(queryData, updateData);
      await ElasticService.deleteObject(elasticIndex, 'fixture', fixture._id);
      return ResponseHelper.json(200, res, 'Fixture successfully deleted', fixture);
    } catch (err) {
      return ResponseHelper.error(err, res);
    }
  },
};

module.exports = FixtureController;
