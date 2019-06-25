const express = require('express');
const UserController = require('../controllers/UserController');
// const AuthController = require('../controllers/AuthController');

const router = express.Router();

router.post('/user', UserController.create);
router.get('/user/:id', UserController.read);
router.patch('/user/:id', UserController.update);
router.delete('/user/:id', UserController.delete);

module.exports = router;
