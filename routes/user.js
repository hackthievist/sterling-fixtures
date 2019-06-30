const express = require('express');
const UserController = require('../controllers/UserController');
const { isAuthenticated } = require('../policies/authenticated');
const { isAdmin } = require('../policies/isAdmin');

const router = express.Router();

router.post('/', UserController.create);
router.get('/', isAuthenticated, UserController.read);
router.get('/all', isAuthenticated, isAdmin, UserController.list);
router.patch('/', isAuthenticated, UserController.update);
router.delete('/', isAuthenticated, UserController.delete);

module.exports = router;
