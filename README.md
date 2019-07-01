# STERLING FIXTURES

Sterling Fixtures API

* [Installation](#installation)
* [Starting App](#starting-app)
* [Testing](#testing)
* [Docker](#docker)

## Installation

These instructions are for use without docker

* Make sure that [Node.js](https://nodejs.org/) is installed.
* Install Node.js modules with `yarn` [YarnPKG](https://yarnpkg.com/):
```shell
yarn install
```

## Starting App

* To run the app, copy the file `.env.example` to `.env` and substitute the settings to match your development environment.
* Start the app with `npm`:
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
* Copy the file `docker-config/secrets.env.example` to `docker-config/secrets.env` and substitute the settings to match your development environment.

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