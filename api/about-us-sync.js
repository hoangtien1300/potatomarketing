// Vercel Serverless Function: POST /api/about-us/sync
const handler = require('./about-us.js');

module.exports = async (req, res) => {
  return handler(req, res);
};
