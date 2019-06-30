const express = require('express');
const TeamController = require('../controllers/TeamController');
const { isAuthenticated } = require('../policies/authenticated');
const { isAdmin } = require('../policies/isAdmin');

const router = express.Router();

router.post('/', isAuthenticated, isAdmin, TeamController.create);
router.get('/:id', isAuthenticated, TeamController.read);
router.get('/', isAuthenticated, TeamController.list);
router.patch('/:id', isAuthenticated, isAdmin, TeamController.update);
router.delete('/:id', isAuthenticated, isAdmin, TeamController.delete);

module.exports = router;
