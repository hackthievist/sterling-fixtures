const express = require('express');
const { isAuthenticated } = require('../policies/authenticated');
const FixtureController = require('../controllers/FixtureController');
const TeamController = require('../controllers/TeamController');
const { limiter } = require('../limiter');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', { title: 'Sterling Fixtures' });
});

router.get('/all-fixtures', isAuthenticated, limiter, FixtureController.getFixtures);
router.get('/all-teams', isAuthenticated, limiter, TeamController.list);


module.exports = router;
