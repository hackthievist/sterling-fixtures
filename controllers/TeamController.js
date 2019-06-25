const Team = require('./promise').TeamPromise;
const ResponseHelper = require('./ResponseHelper');

const TeamController = {
  async create(req, res) {
    try {
      const data = req.body;
      data.createdAt = new Date();
      data.updatedAt = new Date();
      const team = await Team.create(data);
      return ResponseHelper.json(201, res, 'Team created successfully', team);
    } catch (error) {
      return res.status(400).send({
        message: 'Error creating team',
        error,
      });
    }
  },

  async read(req, res) {
    try {
      const teamId = req.params.id;
      const queryData = { _id: teamId, isDeleted: false };
      const team = await Team.findOne(queryData);
      if (!team) return ResponseHelper.json(404, res, 'Team not found');
      return ResponseHelper.json(200, res, 'Team successfully retrieved', team);
    } catch (err) {
      return ResponseHelper.error(err, res);
    }
  },

  async update(req, res) {
    try {
      const teamId = req.params.id;
      const queryData = { _id: teamId, isDeleted: false };
      const updateData = req.body;
      updateData.updatedAt = new Date();
      const team = await Team.findOneAndUpdate(queryData, updateData);
      if (!team) return ResponseHelper.json(404, res, 'Team not found');
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
      return ResponseHelper.json(200, res, 'Team successfully deleted', team);
    } catch (err) {
      return ResponseHelper.error(err, res);
    }
  },
};

module.exports = TeamController;
