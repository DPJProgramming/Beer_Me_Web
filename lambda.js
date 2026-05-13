import serverless from 'serverless-http';
import app from './server.js';

module.exports.handler = serverless(app);