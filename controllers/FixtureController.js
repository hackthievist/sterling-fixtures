/* eslint-disable no-underscore-dangle */
const _ = require('lodash');
const Team = require('./promise').TeamPromise;
const Fixture = require('./promise').FixturePromise;
const ResponseHelper = require('./ResponseHelper');

const FixtureController = {
  async create(req, res) {
    try {
      const data = req.body;
      data.createdAt = new Date();
      data.updatedAt = new Date();
      const homeTeam = await Team.findOne({ _id: data.homeTeam, isDeleted: false });
      const awayTeam = await Team.findOne({ _id: data.awayTeam, isDeleted: false });
      if (!homeTeam || !awayTeam) return ResponseHelper.json(400, res, 'Two teams must be provided');
      if (_.isEqual(homeTeam, awayTeam)) return ResponseHelper.json(400, res, 'A team cannot play against itself');
      const fixtureExists = await Fixture.findOne({
        homeTeam: homeTeam.id, awayTeam: awayTeam.id, date: data.date, isDeleted: false,
      });
      if (fixtureExists) return ResponseHelper.json(400, res, 'Duplicate Fixture', fixtureExists);
      data.fixtureSlug = `${homeTeam.slug}-${awayTeam.slug}`;
      const fixture = await Fixture.create(data);
      const foundFixture = await Fixture.findOne({ _id: fixture._id, isDeleted: false });
      return ResponseHelper.json(201, res, 'Fixture created successfully', foundFixture);
    } catch (error) {
      return ResponseHelper.error(error, res);
    }
  },

  async read(req, res) {
    try {
      const fixtureId = req.params.id;
      const queryData = { _id: fixtureId, isDeleted: false };
      const fixture = await Fixture.findOne(queryData);
      if (!fixture) return ResponseHelper.json(404, res, 'Fixture not found');
      return ResponseHelper.json(200, res, 'Fixture successfully retrieved', fixture);
    } catch (err) {
      return ResponseHelper.error(err, res);
    }
  },

  async getFixtures(req, res) {
    try {
      const { status } = req.query;
      const queryData = { isDeleted: false };
      if (status) queryData.status = status;
      const fixtures = await Fixture.find(queryData);
      if (!fixtures.length) return ResponseHelper.json(404, res, 'There are no fixtures', fixtures);
      return ResponseHelper.json(200, res, 'Fixtures successfully retrieved', fixtures);
    } catch (err) {
      console.log(err);
      return ResponseHelper.error(err, res);
    }
  },

  async update(req, res) {
    try {
      const fixtureId = req.params.id;
      const queryData = { _id: fixtureId, isDeleted: false };
      const updateData = req.body;
      updateData.updatedAt = new Date();
      const fixture = await Fixture.findOneAndUpdate(queryData, updateData);
      if (!fixture) return ResponseHelper.json(404, res, 'Fixture not found');
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
      if (!foundFixture) return ResponseHelper.json(404, res, 'Fixture does not exist');
      if (foundFixture.status === 'completed') return ResponseHelper.json(400, res, 'Completed matches cannot be cancelled');
      if (foundFixture.status === 'cancelled') return ResponseHelper.json(400, res, 'Match was previously cancelled');
      const updateData = { status: 'cancelled' };
      updateData.updatedAt = new Date();
      const fixture = await Fixture.findOneAndUpdate(queryData, updateData);
      return ResponseHelper.json(200, res, 'Fixture successfully updated', fixture);
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
      if (!foundFixture) return ResponseHelper.json(404, res, 'Fixture does not exist');
      if (!_.has(updateData, 'startDate')) updateData.startDate = foundFixture.startDate;
      if (!_.has(updateData, 'endDate')) updateData.endDate = foundFixture.endDate;
      const startDate = new Date(updateData.startDate);
      const endDate = new Date(updateData.endDate);
      const currentDate = new Date();
      if (startDate - currentDate < 0 || endDate - currentDate < 0) return ResponseHelper.json(400, res, 'The postponed dates have to be in the future');
      if (endDate - startDate < 0) return ResponseHelper.json(400, res, 'The end date has to be later than the start date');
      if (foundFixture.status === 'completed') return ResponseHelper.json(400, res, 'Completed matches cannot be postponed');
      updateData.status = 'pending';
      updateData.updatedAt = new Date();
      const fixture = await Fixture.findOneAndUpdate(queryData, updateData);
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
      return ResponseHelper.json(200, res, 'Fixture successfully deleted', fixture);
    } catch (err) {
      return ResponseHelper.error(err, res);
    }
  },
};

module.exports = FixtureController;
