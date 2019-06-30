const chai = require('chai');
const request = require('supertest');
const mongoose = require('mongoose');
const sinon = require('sinon');
const Team = require('../models/Team');
const app = require('../app');
const teamProvider = require('./fixtures/team');
const ElasticService = require('../services/ElasticService');

const { expect } = chai;

// chai.use(chaiHttp);
const dbData = {};
const requiredKeys = ['name', 'slug'];
describe('TeamController', () => {
  const clearDb = async () => {
    await Team.remove();
  };

  const setUp = async () => {
    const teamData = teamProvider.getRecord();
    const team = await Team.create(teamData);
    dbData.team = team;
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
        .expect(201)
        .send(newTeam);
      expect(response.body).to.be.an('object').with.property('message', 'Team created successfully');
      expect(response.body.data).to.be.an('object').and.contain.keys(requiredKeys);
    });

    it('should return 201: Team created successfully (no slug provided, should generate slug)', async () => {
      delete newTeam.slug;
      const newTeamSlug = newTeam.name.substr(1, 3).toUpperCase();
      const response = await request(app)
        .post('/team')
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
        .expect(400)
        .send(newTeam);
      expect(response.body).to.be.an('object').with.property('message', 'Team name is required');
    });
  });

  describe('#read()', () => {
    it('should return 200: Team successfully retrieved', async () => {
      const response = await request(app)
        .get(`/team/${dbData.team._id}`)
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
        .expect(404);
      expect(response.body).to.be.an('object').with.property('message', 'Team not found');
    });
  });

  describe('#list()', () => {
    it('should return 200: Teams successfully retrieved', async () => {
      const response = await request(app)
        .get('/teams')
        .expect(200);
      expect(response.body).to.be.an('object').with.property('message', 'Teams successfully retrieved');
      expect(response.body.data).to.be.an('array').with.lengthOf(1);
      expect(response.body.data[0]).to.be.an('object').and.contains.keys(requiredKeys);
      expect(response.body.data[0]._id).to.equals(dbData.team._id.toString());
    });
  });

  describe('#update()', () => {
    const newTeam = teamProvider.getRecord();
    it('should return 200: Team updated successfully', async () => {
      const response = await request(app)
        .patch(`/team/${dbData.team._id}`)
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
        .expect(404)
        .send(newTeam);
      expect(response.body).to.be.an('object').with.property('message', 'Team not found');
    });
  });

  describe('#delete()', () => {
    it('should return 200: Team deleted successfully', async () => {
      const response = await request(app)
        .delete(`/team/${dbData.team._id}`)
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
        .expect(404);
      expect(response.body).to.be.an('object').with.property('message', 'Team not found');
    });
  });
});
