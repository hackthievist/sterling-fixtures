const express = require('express');
const FixtureController = require('../controllers/FixtureController');
const { isAuthenticated } = require('../policies/authenticated');
const { isAdmin } = require('../policies/isAdmin');

const router = express.Router();

router.post('/', isAuthenticated, isAdmin, FixtureController.create);
router.get(['/:id', isAuthenticated, '/fixture'], isAuthenticated, FixtureController.read);
router.get('/get-fixtures', isAuthenticated, FixtureController.getFixtures);
router.patch('/:id', isAuthenticated, isAdmin, FixtureController.update);
router.patch('/cancel/:id', isAuthenticated, isAdmin, FixtureController.cancel);
router.patch('/postpone/:id', isAuthenticated, isAdmin, FixtureController.postpone);
router.delete('/:id', isAuthenticated, isAdmin, FixtureController.delete);

module.exports = router;
