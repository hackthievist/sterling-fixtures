const chai = require('chai');
const request = require('supertest');
const mongoose = require('mongoose');
const sinon = require('sinon');
const Fixture = require('../models/Fixture');
const Team = require('../models/Team');
const User = require('../models/User');
const app = require('../app');
const fixtureProvider = require('./fixtures/fixture');
const teamProvider = require('./fixtures/team');
const userProvider = require('./fixtures/user');
const tokenProvider = require('./fixtures/token');
const firebaseLinksProvider = require('./fixtures/firebase-links');
const ElasticService = require('../services/ElasticService');
const FirebaseService = require('../services/FirebaseService');

const { expect } = chai;

const dbData = {};
let tokenData;
const requiredKeys = ['homeTeam', 'awayTeam', 'fixtureSlug'];
describe('FixtureController', () => {
  const clearDb = async () => {
    await Fixture.deleteMany();
    await Team.deleteMany();
  };

  const setUp = async () => {
    const homeTeamData = teamProvider.getRecord();
    const homeTeam = await Team.create(homeTeamData);
    dbData.homeTeam = homeTeam;
    const awayTeamData = teamProvider.getRecord();
    const awayTeam = await Team.create(awayTeamData);
    dbData.awayTeam = awayTeam;
    const fixtureData = fixtureProvider.getRecord({ homeTeam: dbData.homeTeam._id, awayTeam: dbData.awayTeam._id, status: 'pending' });
    const fixture = await Fixture.create(fixtureData);
    dbData.fixture = fixture;
    const cancelledFixtureData = fixtureProvider.getRecord({ homeTeam: dbData.homeTeam._id, awayTeam: dbData.awayTeam._id, status: 'cancelled' });
    const cancelledFixture = await Fixture.create(cancelledFixtureData);
    dbData.cancelledFixture = cancelledFixture;
    const userData = userProvider.getRecord({ role: 'admin' });
    const user = await User.create(userData);
    dbData.user = user;
  };

  const getToken = async () => {
    tokenData = tokenProvider.getToken(dbData.user);
  };

  let elasticServiceStubAdd;
  let elasticServiceStubUpdate;
  let elasticServiceStubDelete;
  let firebaseServiceStub;

  const stubElasticServiceAdd = () => {
    elasticServiceStubAdd = sinon.stub(ElasticService, 'addObject');
    elasticServiceStubAdd.returns({});
  };

  const stubElasticServiceUpdate = () => {
    elasticServiceStubUpdate = sinon.stub(ElasticService, 'updateObject');
    elasticServiceStubUpdate.returns({});
  };

  const stubElasticServiceDelete = () => {
    elasticServiceStubDelete = sinon.stub(ElasticService, 'deleteObject');
    elasticServiceStubDelete.returns({});
  };

  const stubFirebaseService = () => {
    firebaseServiceStub = sinon.stub(FirebaseService, 'getShortLink');
    firebaseServiceStub.returns(firebaseLinksProvider.getRecord().shortLink);
  };

  const restoreElasticService = () => {
    ElasticService.addObject.restore();
    ElasticService.updateObject.restore();
    ElasticService.deleteObject.restore();
  };

  const restoreFirebaseService = () => {
    FirebaseService.getShortLink.restore();
  };


  beforeAll(clearDb);
  beforeEach(setUp);
  beforeEach(getToken);
  afterEach(clearDb);
  beforeEach(stubElasticServiceAdd);
  beforeEach(stubElasticServiceUpdate);
  beforeEach(stubElasticServiceDelete);
  afterEach(restoreElasticService);
  beforeEach(stubFirebaseService);
  afterEach(restoreFirebaseService);


  describe('#create()', () => {
    it('should return 201: Fixture created successfully', async () => {
      const startDate = new Date();
      const endDate = new Date();
      startDate.setHours(startDate.getHours() + 2);
      endDate.setHours(startDate.getHours() + 4);
      const newFixture = fixtureProvider.getRecord({
        homeTeam: dbData.homeTeam._id, awayTeam: dbData.awayTeam._id, status: 'pending', startDate, endDate,
      });
      const response = await request(app)
        .post('/fixture')
        .set('Authorization', `Bearer ${tokenData}`)
        .expect(201)
        .send(newFixture);
      expect(response.body).to.be.an('object').with.property('message', 'Fixture created successfully');
      expect(response.body.data).to.be.an('object').and.contain.keys(requiredKeys);
    });

    it('should return 201: Fixture created successfully (no slug provided, should generate fixture slug)', async () => {
      const startDate = new Date();
      const endDate = new Date();
      startDate.setHours(startDate.getHours() + 2);
      endDate.setHours(startDate.getHours() + 4);
      const newFixture = fixtureProvider.getRecord({
        homeTeam: dbData.homeTeam._id, awayTeam: dbData.awayTeam._id, status: 'pending', startDate, endDate,
      });
      delete newFixture.fixtureSlug;
      const newFixtureSlug = `${dbData.homeTeam.slug}${dbData.awayTeam.slug}`;
      const response = await request(app)
        .post('/fixture')
        .set('Authorization', `Bearer ${tokenData}`)
        .expect(201)
        .send(newFixture);
      expect(response.body).to.be.an('object').with.property('message', 'Fixture created successfully');
      expect(response.body.data).to.be.an('object').and.contain.keys(requiredKeys);
      expect(response.body.data.fixtureSlug).to.be.equal(newFixtureSlug);
    });

    it('should return 400: Please provide valid home and away teams', async () => {
      const newFixture = fixtureProvider.getRecord({ homeTeam: dbData.homeTeam._id, awayTeam: dbData.awayTeam._id, status: 'pending' });
      delete newFixture.homeTeam;
      const response = await request(app)
        .post('/fixture')
        .set('Authorization', `Bearer ${tokenData}`)
        .expect(400)
        .send(newFixture);
      expect(response.body).to.be.an('object').with.property('message', 'Please provide valid home and away teams');
    });

    it('should return 400: A team cannot play against itself', async () => {
      const newFixture = fixtureProvider.getRecord({ homeTeam: dbData.homeTeam._id, awayTeam: dbData.homeTeam._id, status: 'pending' });
      const response = await request(app)
        .post('/fixture')
        .set('Authorization', `Bearer ${tokenData}`)
        .expect(400)
        .send(newFixture);
      expect(response.body).to.be.an('object').with.property('message', 'A team cannot play against itself');
    });

    it('should return 400: Provide valid start and end dates', async () => {
      const startDate = new Date();
      startDate.setHours(startDate.getHours() + 2);
      const newFixture = fixtureProvider.getRecord({
        homeTeam: dbData.homeTeam._id, awayTeam: dbData.awayTeam._id, status: 'pending', startDate,
      });
      delete newFixture.endDate;
      const response = await request(app)
        .post('/fixture')
        .set('Authorization', `Bearer ${tokenData}`)
        .expect(400)
        .send(newFixture);
      expect(response.body).to.be.an('object').with.property('message', 'Provide valid start and end dates');
    });

    it('should return 400: The end date has to be later than the start date', async () => {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setHours(startDate.getHours() + 1);
      startDate.setHours(startDate.getHours() + 2);
      const newFixture = fixtureProvider.getRecord({
        homeTeam: dbData.homeTeam._id, awayTeam: dbData.awayTeam._id, status: 'pending', startDate, endDate,
      });
      const response = await request(app)
        .post('/fixture')
        .set('Authorization', `Bearer ${tokenData}`)
        .expect(400)
        .send(newFixture);
      expect(response.body).to.be.an('object').with.property('message', 'The end date has to be later than the start date');
    });

    it('should return 400: The start and end dates have to be in the future', async () => {
      const startDate = new Date();
      const endDate = new Date();
      startDate.setHours(startDate.getHours() - 2);
      endDate.setHours(startDate.getHours());
      const newFixture = fixtureProvider.getRecord({
        homeTeam: dbData.homeTeam._id, awayTeam: dbData.awayTeam._id, status: 'pending', startDate, endDate,
      });
      const response = await request(app)
        .post('/fixture')
        .set('Authorization', `Bearer ${tokenData}`)
        .expect(400)
        .send(newFixture);
      expect(response.body).to.be.an('object').with.property('message', 'The start and end dates have to be in the future');
    });

    it('should return 400: Duplicate Fixture', async () => {
      const newFixture = dbData.fixture;
      const response = await request(app)
        .post('/fixture')
        .set('Authorization', `Bearer ${tokenData}`)
        .expect(400)
        .send(newFixture);
      expect(response.body).to.be.an('object').with.property('message', 'Duplicate Fixture');
    });
  });

  describe('#read()', () => {
    it('should return 200: Fixture successfully retrieved', async () => {
      const response = await request(app)
        .get(`/fixture/${dbData.fixture._id}`)
        .set('Authorization', `Bearer ${tokenData}`)
        .expect(200);
      expect(response.body).to.be.an('object').with.property('message', 'Fixture successfully retrieved');
      expect(response.body.data).to.be.an('object').and.contains.keys(requiredKeys);
      expect(response.body.data._id).to.equals(dbData.fixture._id.toString());
    });

    it('should return 404: Fixture not found', async () => {
      const idData = fixtureProvider.getId();
      const randomId = mongoose.Types.ObjectId(idData);
      const response = await request(app)
        .get(`/fixture/${randomId}`)
        .set('Authorization', `Bearer ${tokenData}`)
        .expect(404);
      expect(response.body).to.be.an('object').with.property('message', 'Fixture not found');
    });
  });

  describe('#getFixtures()', () => {
    it('should return 200: Fixtures successfully retrieved', async () => {
      const response = await request(app)
        .get('/fixture')
        .set('Authorization', `Bearer ${tokenData}`)
        .expect(200);
      expect(response.body).to.be.an('object').with.property('message', 'Fixtures successfully retrieved');
      expect(response.body.data).to.be.an('array').with.lengthOf(2);
      expect(response.body.data[0]).to.be.an('object').and.contains.keys(requiredKeys);
      expect(response.body.data[0]._id).to.equals(dbData.fixture._id.toString());
    });
  });

  describe('#update()', () => {
    const updateData = fixtureProvider.getRecord();
    it('should return 200: Fixture updated successfully', async () => {
      const response = await request(app)
        .patch(`/fixture/${dbData.fixture._id}`)
        .set('Authorization', `Bearer ${tokenData}`)
        .expect(200)
        .send(updateData);
      expect(response.body).to.be.an('object').with.property('message', 'Fixture successfully updated');
      expect(response.body.data).to.be.an('object').and.contain.keys(requiredKeys);
      expect(response.body.data._id).to.equals(dbData.fixture._id.toString());
      expect(response.body.data.fixtureSlug).to.equals(updateData.fixtureSlug);
    });

    it('should return 404: Fixture not found', async () => {
      const idData = fixtureProvider.getId();
      const randomId = mongoose.Types.ObjectId(idData);
      const response = await request(app)
        .patch(`/fixture/${randomId}`)
        .set('Authorization', `Bearer ${tokenData}`)
        .expect(404);
      expect(response.body).to.be.an('object').with.property('message', 'Fixture not found');
    });
  });

  describe('#cancel()', () => {
    it('should return 200: Fixture successfully cancelled', async () => {
      const response = await request(app)
        .patch(`/fixture/cancel/${dbData.fixture._id}`)
        .set('Authorization', `Bearer ${tokenData}`)
        .expect(200);
      expect(response.body).to.be.an('object').with.property('message', 'Fixture successfully cancelled');
      expect(response.body.data).to.be.an('object').and.contain.keys(requiredKeys);
      expect(response.body.data._id).to.equals(dbData.fixture._id.toString());
      expect(response.body.data.status).to.equals('cancelled');
    });

    it('should return 404: Fixture not found', async () => {
      const idData = fixtureProvider.getId();
      const randomId = mongoose.Types.ObjectId(idData);
      const response = await request(app)
        .patch(`/fixture/cancel/${randomId}`)
        .set('Authorization', `Bearer ${tokenData}`)
        .expect(404);
      expect(response.body).to.be.an('object').with.property('message', 'Fixture not found');
    });

    it('should return 400: Match has been previously cancelled', async () => {
      try {
        const response = await request(app)
          .patch(`/fixture/cancel/${dbData.cancelledFixture._id}`)
          .set('Authorization', `Bearer ${tokenData}`)
          .expect(400);
        expect(response.body).to.be.an('object').with.property('message', 'Match has been previously cancelled');
        expect(response.body.data).to.be.an('object').and.contain.keys(requiredKeys);
        expect(response.body.data._id).to.equals(dbData.cancelledFixture._id.toString());
        expect(response.body.data.status).to.equals('cancelled');
      } catch (err) {
        throw new Error(err);
      }
    });
  });

  describe('#postpone()', () => {
    it('should return 200: Fixture successfully postponed', async () => {
      try {
        const startDate = new Date();
        const endDate = new Date();
        startDate.setHours(startDate.getHours() + 2);
        endDate.setHours(startDate.getHours() + 4);
        const updateData = { startDate, endDate };
        const response = await request(app)
          .patch(`/fixture/postpone/${dbData.fixture._id}`)
          .set('Authorization', `Bearer ${tokenData}`)
          .expect(200)
          .send(updateData);
        expect(response.body).to.be.an('object').with.property('message', 'Fixture successfully postponed');
        expect(response.body.data).to.be.an('object').and.contain.keys(requiredKeys);
        expect(response.body.data._id).to.equals(dbData.fixture._id.toString());
        expect(response.body.data.status).to.equals('pending');
      } catch (err) {
        throw new Error(err);
      }
    });

    it('should return 404: Fixture not found', async () => {
      try {
        const idData = fixtureProvider.getId();
        const randomId = mongoose.Types.ObjectId(idData);
        const response = await request(app)
          .patch(`/fixture/postpone/${randomId}`)
          .set('Authorization', `Bearer ${tokenData}`)
          .expect(404);
        expect(response.body).to.be.an('object').with.property('message', 'Fixture not found');
      } catch (err) {
        throw new Error(err);
      }
    });

    it('should return 400: The postponed dates have to be in the future', async () => {
      try {
        const startDate = new Date();
        const endDate = new Date();
        startDate.setHours(startDate.getHours() - 2);
        endDate.setHours(startDate.getHours() - 4);
        const updateData = { startDate, endDate };
        const response = await request(app)
          .patch(`/fixture/postpone/${dbData.fixture._id}`)
          .set('Authorization', `Bearer ${tokenData}`)
          .expect(400)
          .send(updateData);
        expect(response.body).to.be.an('object').with.property('message', 'The postponed dates have to be in the future');
      } catch (err) {
        throw new Error(err);
      }
    });

    it('should return 400: The end date has to be later than the start date', async () => {
      try {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setHours(startDate.getHours() + 2);
        startDate.setHours(startDate.getHours() + 4);
        const updateData = { startDate, endDate };
        const response = await request(app)
          .patch(`/fixture/postpone/${dbData.fixture._id}`)
          .set('Authorization', `Bearer ${tokenData}`)
          .expect(400)
          .send(updateData);
        expect(response.body).to.be.an('object').with.property('message', 'The end date has to be later than the start date');
      } catch (err) {
        throw new Error(err);
      }
    });
  });

  describe('#delete()', () => {
    it('should return 200: Fixture deleted successfully', async () => {
      const response = await request(app)
        .delete(`/fixture/${dbData.fixture._id}`)
        .set('Authorization', `Bearer ${tokenData}`)
        .expect(200);
      expect(response.body).to.be.an('object').with.property('message', 'Fixture successfully deleted');
      expect(response.body.data).to.be.an('object').and.contain.keys(requiredKeys);
      expect(response.body.data._id).to.equals(dbData.fixture._id.toString());
    });

    it('should return 404: Fixture not found', async () => {
      const idData = fixtureProvider.getId();
      const randomId = mongoose.Types.ObjectId(idData);
      const response = await request(app)
        .delete(`/fixture/${randomId}`)
        .set('Authorization', `Bearer ${tokenData}`)
        .expect(404);
      expect(response.body).to.be.an('object').with.property('message', 'Fixture not found');
    });
  });
});
