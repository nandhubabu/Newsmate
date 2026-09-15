/**
 * Vercel Serverless Function Entry Point
 * Directs all /api/* traffic to the NewsMate Express application
 */
const app = require('../server');

module.exports = app;
