// Vercel Serverless Function: POST /api/calendar/sync
const handler = require('./calendar.js');

module.exports = async (req, res) => {
  return handler(req, res);
};
