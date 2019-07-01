# STERLING FIXTURES

Sterling Fixtures API

* [Installation](#installation)
* [Starting App](#starting-app)
* [Testing](#testing)
* [Docker](#docker)

## Installation

These instructions are for use without docker

* Clone the repository [https://github.com/hackthievist/sterling-fixtures.git](https://github.com/hackthievist/sterling-fixtures.git)
* Make sure that [Node.js](https://nodejs.org/) is installed.
* Install Node.js modules with `yarn` [YarnPKG](https://yarnpkg.com/):
```shell
yarn install
```

## Documentation

* The API documentation with Postman can be found [https://documenter.getpostman.com/view/5455096/S1a7X6Fb](here)

## Starting App

* To run the app, copy the file `.env.example` to `.env` and substitute the settings to match your development environment.
* Make sure `mongo`, `redis` and `elasticsearch` are installed and running if you plan on using them locally.
* Start the app with `yarn`:
```shell
yarn start
```
* Navigate to [localhost:3000](http://localhost:3000). Please note `3000` is the default port used, you can change this in `.env`.

## Testing

* Tests are written using the [Jest](https://jestjs.io/) library.
* To run tests with `yarn` use:
```shell
yarn test
```

## Docker
### Using Docker Standalone - Compose (Recomended for local development)
* Copy the files `docker-config/secrets.env.example`, `docker-config/config.env.example` to `docker-config/secrets.env`, `docker-config/config.env` and substitute the settings to match your development environment.

Make sure mongodb is installed and running with IP bound to docker service `mongo`
```shell
mongod --bind_ip mongo
```

```shell
docker-compose up -d
```
* see logs
```shell
docker-compose logs -f
```
* run tests
```shell
docker-compose run --rm fixtures-api_web yarn test
```
* tear down
```shell
docker-compose down
```

## Visit App

* Navigate to [https://sterlingfixtures.herokuapp.com](https://sterlingfixtures.herokuapp.com) or [http://localhost:3000](http://localhost:3000)(docker standalone)


## Tests

* There are 3 test suites, with 51 test cases for Fixture, Team and User. They can be found in tests/

## Stack

* Backend Language + Framework: Nodejs + Express
* Database: MongoDB
* Testing Framework: Jest
* Hosting Server: Heroku
* Container Platform: Docker
* Session Management: Redis
* Authentication/Authorization: Bearer Token/JWT

## Extras
* Rate Limit: Requests to the fixtures-api are limited to 50 per 15 minutes.