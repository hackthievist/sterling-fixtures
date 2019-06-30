const _ = require('lodash');
const bcrypt = require('bcrypt');
const cache = require('express-redis-cache')({
  host: process.env.REDIS_HOST, auth_pass: process.env.REDIS_PASSWORD, port: process.env.REDIS_PORT,
});
const User = require('./promise').UserPromise;
const ResponseHelper = require('./ResponseHelper');

const UserController = {
  async create(req, res) {
    try {
      const data = _.omit(req.body, ['role']);
      data.createdAt = new Date();
      data.updatedAt = new Date();
      if (!data.password) return ResponseHelper.json(400, res, 'Password is required');
      if (!data.email) return ResponseHelper.json(400, res, 'Email is required');
      if (!data.userName) return ResponseHelper.json(400, res, 'Username is required');
      const userFound = await User.findOne({ email: data.email });
      if (userFound) return ResponseHelper.json(400, res, 'Email has been taken');
      data.password = bcrypt.hashSync(data.password, 10);
      const user = await User.create(data);
      return ResponseHelper.json(201, res, 'User created successfully', user);
    } catch (error) {
      return ResponseHelper.error(error, res);
    }
  },

  async read(req, res) {
    try {
      cache.route();
      const userId = req.params.id;
      const queryData = { _id: userId, isDeleted: false };
      const user = await User.findOne(queryData);
      if (!user) return ResponseHelper.json(404, res, 'User not found');
      return ResponseHelper.json(200, res, 'User successfully retrieved', user);
    } catch (err) {
      return ResponseHelper.error(err, res);
    }
  },

  async list(req, res) {
    try {
      cache.route();
      const queryData = { isDeleted: false };
      const users = await User.find(queryData);
      if (users.length === 0) return ResponseHelper.json(404, res, 'No users found');
      return ResponseHelper.json(200, res, 'Users successfully retrieved', users);
    } catch (err) {
      return ResponseHelper.error(err, res);
    }
  },

  async update(req, res) {
    try {
      const userId = req.params.id;
      const queryData = { _id: userId, isDeleted: false };
      const updateData = _.omit(req.body, ['role']);
      updateData.updatedAt = new Date();
      const user = await User.findOneAndUpdate(queryData, updateData);
      if (!user) return ResponseHelper.json(404, res, 'User not found');
      return ResponseHelper.json(200, res, 'User successfully updated', user);
    } catch (err) {
      return ResponseHelper.error(err, res);
    }
  },

  async delete(req, res) {
    try {
      const userId = req.params.id;
      const queryData = { _id: userId, isDeleted: false };
      const foundUser = await User.findOne(queryData);
      if (!foundUser) return ResponseHelper.json(404, res, 'User not found');
      const updateData = {
        isDeleted: true, updatedAt: new Date(), deletedAt: new Date(), email: `${foundUser.email}-${_.now()}`,
      };
      const user = await User.findOneAndUpdate(queryData, updateData);
      return ResponseHelper.json(200, res, 'User successfully deleted', user);
    } catch (err) {
      return ResponseHelper.error(err, res);
    }
  },
};

module.exports = UserController;
