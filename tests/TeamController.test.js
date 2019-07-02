const chai = require('chai');
const request = require('supertest');
const mongoose = require('mongoose');
const sinon = require('sinon');
const Team = require('../models/Team');
const User = require('../models/User');
const app = require('../app');
const teamProvider = require('./fixtures/team');
const userProvider = require('./fixtures/user');
const tokenProvider = require('./fixtures/token');
const ElasticService = require('../services/ElasticService');

const { expect } = chai;

const dbData = {};
let tokenData;
let invalidTokenData;
let nonAdminTokenData;
const requiredKeys = ['name', 'slug'];
describe('TeamController', () => {
  const clearDb = async () => {
    await Team.deleteMany();
  };

  const setUp = async () => {
    const teamData = teamProvider.getRecord();
    const team = await Team.create(teamData);
    dbData.team = team;

    const userData = userProvider.getRecord({ role: 'admin' });
    const user = await User.create(userData);
    dbData.user = user;

    const nonAdminUserData = userProvider.getRecord({ role: 'user' });
    const nonAdminUser = await User.create(nonAdminUserData);
    dbData.nonAdminUser = nonAdminUser;

    const deletedUserData = userProvider.getRecord({ isDeleted: true });
    const deletedUser = await User.create(deletedUserData);
    dbData.deletedUser = deletedUser;
  };

  const getToken = () => {
    tokenData = tokenProvider.getToken(dbData.user);
    invalidTokenData = tokenProvider.getToken(dbData.deletedUser);
    nonAdminTokenData = tokenProvider.getToken(dbData.nonAdminUser);
  };

  let elasticServiceStubAdd;
  let elasticServiceStubUpdate;
  let elasticServiceStubDelete;
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

  const restoreElasticService = () => {
    ElasticService.addObject.restore();
    ElasticService.updateObject.restore();
    ElasticService.deleteObject.restore();
  };


  beforeAll(clearDb);
  beforeEach(setUp);
  beforeEach(getToken);
  beforeEach(stubElasticServiceAdd);
  beforeEach(stubElasticServiceUpdate);
  beforeEach(stubElasticServiceDelete);
  afterEach(restoreElasticService);
  afterEach(clearDb);

  describe('#create()', () => {
    const newTeam = teamProvider.getRecord();
    it('should return 201: Team created successfully', async () => {
      const response = await request(app)
        .post('/team')
        .set('Authorization', `Bearer ${tokenData}`)
        .expect(201)
        .send(newTeam);
      expect(response.body).to.be.an('object').with.property('message', 'Team created successfully');
      expect(response.body.data).to.be.an('object').and.contain.keys(requiredKeys);
    });

    it('should return 201: Team created successfully (no slug provided, should generate slug)', async () => {
      delete newTeam.slug;
      const newTeamSlug = newTeam.name.substr(0, 3).toUpperCase();
      const response = await request(app)
        .post('/team')
        .set('Authorization', `Bearer ${tokenData}`)
        .expect(201)
        .send(newTeam);
      expect(response.body).to.be.an('object').with.property('message', 'Team created successfully');
      expect(response.body.data).to.be.an('object').and.contain.keys(requiredKeys);
      expect(response.body.data.slug).to.be.equal(newTeamSlug);
    });

    it('should return 400: Team name is required', async () => {
      delete newTeam.name;
      const response = await request(app)
        .post('/team')
        .set('Authorization', `Bearer ${tokenData}`)
        .expect(400)
        .send(newTeam);
      expect(response.body).to.be.an('object').with.property('message', 'Team name is required');
    });

    it('should return 401: User from token does not exist', async () => {
      const response = await request(app)
        .post('/team')
        .set('Authorization', `Bearer ${invalidTokenData}`)
        .expect(401)
        .send(newTeam);
      expect(response.body).to.be.an('object').with.property('message', 'User from token does not exist');
    });

    it('should return 401: Unauthorized: Admin Users only', async () => {
      const response = await request(app)
        .post('/team')
        .set('Authorization', `Bearer ${nonAdminTokenData}`)
        .expect(401)
        .send(newTeam);
      expect(response.body).to.be.an('object').with.property('message', 'Unauthorized: Admin Users only');
    });
  });

  describe('#read()', () => {
    it('should return 200: Team successfully retrieved', async () => {
      const response = await request(app)
        .get(`/team/${dbData.team._id}`)
        .set('Authorization', `Bearer ${tokenData}`)
        .expect(200);
      expect(response.body).to.be.an('object').with.property('message', 'Team successfully retrieved');
      expect(response.body.data).to.be.an('object').and.contains.keys(requiredKeys);
      expect(response.body.data._id).to.equals(dbData.team._id.toString());
    });

    it('should return 404: Team not found', async () => {
      const idData = teamProvider.getId();
      const randomId = mongoose.Types.ObjectId(idData);
      const response = await request(app)
        .get(`/team/${randomId}`)
        .set('Authorization', `Bearer ${tokenData}`)
        .expect(404);
      expect(response.body).to.be.an('object').with.property('message', 'Team not found');
    });

    it('should return 401: User from token does not exist', async () => {
      const response = await request(app)
        .get(`/team/${dbData.team._id}`)
        .set('Authorization', `Bearer ${invalidTokenData}`)
        .expect(401);
      expect(response.body).to.be.an('object').with.property('message', 'User from token does not exist');
    });
  });

  describe('#list()', () => {
    it('should return 200: Teams successfully retrieved', async () => {
      const response = await request(app)
        .get('/all-teams')
        .set('Authorization', `Bearer ${tokenData}`)
        .expect(200);
      expect(response.body).to.be.an('object').with.property('message', 'Teams successfully retrieved');
      expect(response.body.data).to.be.an('array').with.lengthOf(1);
      expect(response.body.data[0]).to.be.an('object').and.contains.keys(requiredKeys);
      expect(response.body.data[0]._id).to.equals(dbData.team._id.toString());
    });

    it('should return 401: User from token does not exist', async () => {
      const response = await request(app)
        .get('/all-teams')
        .set('Authorization', `Bearer ${invalidTokenData}`)
        .expect(401);
      expect(response.body).to.be.an('object').with.property('message', 'User from token does not exist');
    });
  });

  describe('#update()', () => {
    const newTeam = teamProvider.getRecord();
    it('should return 200: Team updated successfully', async () => {
      const response = await request(app)
        .patch(`/team/${dbData.team._id}`)
        .set('Authorization', `Bearer ${tokenData}`)
        .expect(200)
        .send(newTeam);
      expect(response.body).to.be.an('object').with.property('message', 'Team successfully updated');
      expect(response.body.data).to.be.an('object').and.contain.keys(requiredKeys);
      expect(response.body.data._id).to.equals(dbData.team._id.toString());
    });

    it('should return 404: Team not found', async () => {
      const idData = teamProvider.getId();
      const randomId = mongoose.Types.ObjectId(idData);
      const response = await request(app)
        .patch(`/team/${randomId}`)
        .set('Authorization', `Bearer ${tokenData}`)
        .expect(404)
        .send(newTeam);
      expect(response.body).to.be.an('object').with.property('message', 'Team not found');
    });
  });

  describe('#delete()', () => {
    it('should return 200: Team deleted successfully', async () => {
      const response = await request(app)
        .delete(`/team/${dbData.team._id}`)
        .set('Authorization', `Bearer ${tokenData}`)
        .expect(200);
      expect(response.body).to.be.an('object').with.property('message', 'Team successfully deleted');
      expect(response.body.data).to.be.an('object').and.contain.keys(requiredKeys);
      expect(response.body.data._id).to.equals(dbData.team._id.toString());
    });

    it('should return 404: Team not found', async () => {
      const idData = teamProvider.getId();
      const randomId = mongoose.Types.ObjectId(idData);
      const response = await request(app)
        .delete(`/team/${randomId}`)
        .set('Authorization', `Bearer ${tokenData}`)
        .expect(404);
      expect(response.body).to.be.an('object').with.property('message', 'Team not found');
    });

    it('should return 401: User from token does not exist', async () => {
      const response = await request(app)
        .patch(`/team/${dbData.team._id}`)
        .set('Authorization', `Bearer ${invalidTokenData}`)
        .expect(401);
      expect(response.body).to.be.an('object').with.property('message', 'User from token does not exist');
    });

    it('should return 401: Unauthorized: Admin Users only', async () => {
      const response = await request(app)
        .patch(`/team/${dbData.team._id}`)
        .set('Authorization', `Bearer ${nonAdminTokenData}`)
        .expect(401);
      expect(response.body).to.be.an('object').with.property('message', 'Unauthorized: Admin Users only');
    });
  });
});
