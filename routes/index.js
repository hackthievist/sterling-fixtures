const express = require('express');
const AuthController = require('../controllers/AuthController');
const UserController = require('../controllers/UserController');
const TeamController = require('../controllers/TeamController');
const FixtureController = require('../controllers/FixtureController');
const SearchController = require('../controllers/SearchController');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', { title: 'Sterling Fixtures' });
});

router.post('/user', UserController.create);
router.get('/user/:id', UserController.read);
router.get('/users', UserController.list);
router.patch('/user/:id', UserController.update);
router.delete('/user/:id', UserController.delete);


router.post('/team', TeamController.create);
router.get('/team/:id', TeamController.read);
router.get('/teams', TeamController.list);
router.patch('/team/:id', TeamController.update);
router.delete('/team/:id', TeamController.delete);

router.post('/fixture', FixtureController.create);
router.get(['/fixture/:id', '/fixture'], AuthController.isAuthenticated, FixtureController.read);
router.get('/get-fixtures', FixtureController.getFixtures);
router.patch('/fixture/:id', FixtureController.update);
router.patch('/fixture/cancel/:id', FixtureController.cancel);
router.patch('/fixture/postpone/:id', FixtureController.postpone);
router.delete('/fixture/:id', FixtureController.delete);

router.post('/search', SearchController.search);

router.post('/login', AuthController.login);
module.exports = router;
