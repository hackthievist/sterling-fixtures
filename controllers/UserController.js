const _ = require('lodash');
const config = require('../config');
const redisClient = require('redis').createClient({ url: config.redis.url });
const cache = require('express-redis-cache')({ client: redisClient });
const User = require('./promise').UserPromise;
const ResponseHelper = require('./ResponseHelper');

const UserController = {
  async create(req, res) {
    try {
      const data = req.body;
      if (!data.password) return ResponseHelper.json(400, res, 'Password is required');
      if (!data.email) return ResponseHelper.json(400, res, 'Email is required');
      if (!data.userName) return ResponseHelper.json(400, res, 'Username is required');
      const userFound = await User.findOne({ email: data.email, userName: data.userName });
      if (userFound) return ResponseHelper.json(400, res, 'Email and username have been taken');
      const user = await User.create(data);
      return ResponseHelper.json(201, res, 'User created successfully', user);
    } catch (error) {
      return ResponseHelper.error(error, res);
    }
  },

  async read(req, res) {
    try {
      cache.route();
      const userId = req.user._id;
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
      const userId = req.user._id;
      const queryData = { _id: userId, isDeleted: false };
      const updateData = _.omit(req.body, ['role']);
      const user = await User.findOneAndUpdate(queryData, updateData);
      if (!user) return ResponseHelper.json(404, res, 'User not found');
      return ResponseHelper.json(200, res, 'User successfully updated', user);
    } catch (err) {
      return ResponseHelper.error(err, res);
    }
  },

  async delete(req, res) {
    try {
      const userId = req.user._id;
      const queryData = { _id: userId, isDeleted: false };
      const foundUser = await User.findOne(queryData);
      if (!foundUser) return ResponseHelper.json(404, res, 'User not found');
      const updateData = {
        isDeleted: true, deletedAt: new Date(), email: `${foundUser.email}-${_.now()}`, userName: `${foundUser.userName}-${_.now()}`,
      };
      const user = await User.findOneAndUpdate(queryData, updateData);
      return ResponseHelper.json(200, res, 'User successfully deleted', user);
    } catch (err) {
      return ResponseHelper.error(err, res);
    }
  },
};

module.exports = UserController;
