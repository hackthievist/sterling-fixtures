const chai = require('chai');
const request = require('supertest');
const mongoose = require('mongoose');
const sinon = require('sinon');
const User = require('../models/User');
const app = require('../app');
const userProvider = require('./fixtures/user');
const ElasticService = require('../services/ElasticService');

const { expect } = chai;

// chai.use(chaiHttp);
const dbData = {};
const requiredKeys = ['userName', 'email', 'password'];
describe('UserController', () => {
  const clearDb = async () => {
    await User.remove();
  };

  const setUp = async () => {
    const userData = userProvider.getRecord();
    const user = await User.create(userData);
    dbData.user = user;
  };

  beforeAll(clearDb);
  beforeEach(setUp);
  afterEach(clearDb);

  describe('#create()', () => {
    it('should return 201: User created successfully', async () => {
      const newUser = userProvider.getRecord();
      const response = await request(app)
        .post('/user')
        .expect(201)
        .send(newUser);
      expect(response.body).to.be.an('object').with.property('message', 'User created successfully');
      expect(response.body.data).to.be.an('object').and.contain.keys(requiredKeys);
    });

    it('should return 400: Password is required', async () => {
      const newUser = userProvider.getRecord();
      delete newUser.password;
      const response = await request(app)
        .post('/user')
        .expect(400)
        .send(newUser);
      expect(response.body).to.be.an('object').with.property('message', 'Password is required');
    });

    it('should return 400: Username is required', async () => {
      const newUser = userProvider.getRecord();
      delete newUser.userName;
      const response = await request(app)
        .post('/user')
        .expect(400)
        .send(newUser);
      expect(response.body).to.be.an('object').with.property('message', 'Username is required');
    });

    it('should return 400: Email is required', async () => {
      const newUser = userProvider.getRecord();
      delete newUser.email;
      const response = await request(app)
        .post('/user')
        .expect(400)
        .send(newUser);
      expect(response.body).to.be.an('object').with.property('message', 'Email is required');
    });

    it('should return 400: Email has been taken', async () => {
      const newUser = userProvider.getRecord({ email: dbData.user.email });
      const response = await request(app)
        .post('/user')
        .expect(400)
        .send(newUser);
      expect(response.body).to.be.an('object').with.property('message', 'Email has been taken');
    });
  });

  describe('#read()', () => {
    it('should return 200: User successfully retrieved', async () => {
      const response = await request(app)
        .get(`/user/${dbData.user._id}`)
        .expect(200);
      expect(response.body).to.be.an('object').with.property('message', 'User successfully retrieved');
      expect(response.body.data).to.be.an('object').and.contains.keys(requiredKeys);
      expect(response.body.data._id).to.equals(dbData.user._id.toString());
    });

    it('should return 404: User not found', async () => {
      const idData = userProvider.getId();
      const randomId = mongoose.Types.ObjectId(idData);
      const response = await request(app)
        .get(`/user/${randomId}`)
        .expect(404);
      expect(response.body).to.be.an('object').with.property('message', 'User not found');
    });
  });

  describe('#list()', () => {
    it('should return 200: Users successfully retrieved', async () => {
      const response = await request(app)
        .get('/users')
        .expect(200);
      expect(response.body).to.be.an('object').with.property('message', 'Users successfully retrieved');
      expect(response.body.data).to.be.an('array').with.lengthOf(1);
      expect(response.body.data[0]).to.be.an('object').and.contains.keys(requiredKeys);
      expect(response.body.data[0]._id).to.equals(dbData.user._id.toString());
    });
  });

  describe('#update()', () => {
    const newUser = userProvider.getRecord();
    it('should return 200: User updated successfully', async () => {
      const response = await request(app)
        .patch(`/user/${dbData.user._id}`)
        .expect(200)
        .send(newUser);
      expect(response.body).to.be.an('object').with.property('message', 'User successfully updated');
      expect(response.body.data).to.be.an('object').and.contain.keys(requiredKeys);
      expect(response.body.data._id).to.equals(dbData.user._id.toString());
    });

    it('should return 404: User not found', async () => {
      const idData = userProvider.getId();
      const randomId = mongoose.Types.ObjectId(idData);
      const response = await request(app)
        .patch(`/user/${randomId}`)
        .expect(404)
        .send(newUser);
      expect(response.body).to.be.an('object').with.property('message', 'User not found');
    });
  });

  describe('#delete()', () => {
    it('should return 200: User deleted successfully', async () => {
      const response = await request(app)
        .delete(`/user/${dbData.user._id}`)
        .expect(200);
      expect(response.body).to.be.an('object').with.property('message', 'User successfully deleted');
      expect(response.body.data).to.be.an('object').and.contain.keys(requiredKeys);
      expect(response.body.data._id).to.equals(dbData.user._id.toString());
    });

    it('should return 404: User not found', async () => {
      const idData = userProvider.getId();
      const randomId = mongoose.Types.ObjectId(idData);
      const response = await request(app)
        .delete(`/user/${randomId}`)
        .expect(404);
      expect(response.body).to.be.an('object').with.property('message', 'User not found');
    });
  });
});
