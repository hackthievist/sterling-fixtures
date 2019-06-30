const express = require('express');
const { limiter } = require('../limiter');
const UserController = require('../controllers/UserController');
const { isAuthenticated } = require('../policies/authenticated');
const { isAdmin } = require('../policies/isAdmin');

const router = express.Router();

router.post('/', limiter, UserController.create);
router.get('/', isAuthenticated, UserController.read);
router.get('/all', isAuthenticated, isAdmin, UserController.list);
router.patch('/', isAuthenticated, limiter, UserController.update);
router.delete('/', isAuthenticated, limiter, UserController.delete);

module.exports = router;
