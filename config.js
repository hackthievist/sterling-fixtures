module.exports = {
  settings: {
    baseUrl: process.env.API_BASE_URL,
    port: process.env.PORT,
  },
  connection: {
    mongodb: {
      url: process.env.MONGO_URL,
      testUrl: process.env.MONGO_TEST_URL,
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    exp: 60000,
  },
  firebase: {
    apiUrl: process.env.FIREBASE_DYNAMIC_LINK_API_URL,
    appUrl: process.env.FIREBASE_DYNAMIC_LINK_APP_URL,
  },
  redis: {
    url: process.env.REDIS_URL,
    secret: process.env.REDIS_SECRET,
  },
  elasticsearch: {
    host: process.env.ELASTIC_HOST,
    indexPrefix: process.env.ELASTIC_PREFIX,
  },
};
