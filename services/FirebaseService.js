const fetch = require('node-fetch');
const config = require('../config');

const firebaseApiUrl = config.firebase.apiUrl;
const firebaseAppUrl = config.firebase.appUrl;

const FirebaseService = {
  async getShortLink(link) {
    try {
      const body = JSON.stringify({ longDynamicLink: `${firebaseAppUrl}${link}` });
      const shortLink = await fetch(firebaseApiUrl, {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/json', 'Content-Length': 256 },
      });
      const json = await shortLink.json();
      return json.shortLink;
    } catch (err) {
      throw new Error(err);
    }
  },
};

module.exports = FirebaseService;
