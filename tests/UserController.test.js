const chai = require('chai');
const request = require('supertest');
const User = require('../models/User');
const app = require('../app');
const userProvider = require('./fixtures/user');
const tokenProvider = require('./fixtures/token');

const { expect } = chai;

const dbData = {};
let tokenData;
let invalidTokenData;
let nonAdminTokenData;
const requiredKeys = ['userName', 'email', 'password'];
describe('UserController', () => {
  const clearDb = async () => {
    await User.deleteMany();
  };

  const setUp = async () => {
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

  beforeAll(clearDb);
  beforeEach(setUp);
  beforeEach(getToken);
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

    it('should return 400: Email and username have been taken', async () => {
      const newUser = userProvider.getRecord({ email: dbData.user.email, userName: dbData.user.userName });
      const response = await request(app)
        .post('/user')
        .expect(400)
        .send(newUser);
      expect(response.body).to.be.an('object').with.property('message', 'Email and username have been taken');
    });
  });

  describe('#read()', () => {
    it('should return 200: User successfully retrieved', async () => {
      const response = await request(app)
        .get('/user')
        .set('Authorization', `Bearer ${tokenData}`)
        .expect(200);
      expect(response.body).to.be.an('object').with.property('message', 'User successfully retrieved');
      expect(response.body.data).to.be.an('object').and.contains.keys(requiredKeys);
      expect(response.body.data._id).to.equals(dbData.user._id.toString());
    });

    it('should return 401: User from token does not exist', async () => {
      const response = await request(app)
        .get('/user')
        .set('Authorization', `Bearer ${invalidTokenData}`)
        .expect(401);
      expect(response.body).to.be.an('object').with.property('message', 'User from token does not exist');
    });
  });

  describe('#list()', () => {
    it('should return 200: Users successfully retrieved', async () => {
      const response = await request(app)
        .get('/user/all')
        .set('Authorization', `Bearer ${tokenData}`)
        .expect(200);
      expect(response.body).to.be.an('object').with.property('message', 'Users successfully retrieved');
      expect(response.body.data).to.be.an('array').with.lengthOf(2);
      expect(response.body.data[0]).to.be.an('object').and.contains.keys(requiredKeys);
      expect(response.body.data[0]._id).to.equals(dbData.user._id.toString());
    });

    it('should return 401: Unauthorized: Admin Users only', async () => {
      const response = await request(app)
        .get('/user/all')
        .set('Authorization', `Bearer ${nonAdminTokenData}`)
        .expect(401);
      expect(response.body).to.be.an('object').with.property('message', 'Unauthorized: Admin Users only');
    });
  });

  describe('#update()', () => {
    const newUser = userProvider.getRecord();
    it('should return 200: User updated successfully', async () => {
      const response = await request(app)
        .patch('/user')
        .set('Authorization', `Bearer ${tokenData}`)
        .expect(200)
        .send(newUser);
      expect(response.body).to.be.an('object').with.property('message', 'User successfully updated');
      expect(response.body.data).to.be.an('object').and.contain.keys(requiredKeys);
      expect(response.body.data._id).to.equals(dbData.user._id.toString());
    });

    it('should return 404: User from token does not exist', async () => {
      const response = await request(app)
        .patch('/user')
        .set('Authorization', `Bearer ${invalidTokenData}`)
        .expect(401)
        .send(newUser);
      expect(response.body).to.be.an('object').with.property('message', 'User from token does not exist');
    });
  });

  describe('#delete()', () => {
    it('should return 200: User deleted successfully', async () => {
      const response = await request(app)
        .delete('/user')
        .set('Authorization', `Bearer ${tokenData}`)
        .expect(200);
      expect(response.body).to.be.an('object').with.property('message', 'User successfully deleted');
      expect(response.body.data).to.be.an('object').and.contain.keys(requiredKeys);
      expect(response.body.data._id).to.equals(dbData.user._id.toString());
    });

    it('should return 404: User from token does not exist', async () => {
      const response = await request(app)
        .delete('/user')
        .set('Authorization', `Bearer ${invalidTokenData}`)
        .expect(401);
      expect(response.body).to.be.an('object').with.property('message', 'User from token does not exist');
    });
  });
});
