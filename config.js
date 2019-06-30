module.exports = {
  settings: {
    baseUrl: process.env.BASE_URL,
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
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    auth_pass: process.env.REDIS_PASSWORD,
  },
  elasticsearch: {
    host: process.env.ELASTIC_HOST,
  },
};
