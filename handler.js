console.log('Handler module loading...');
import serverless from 'serverless-http';
import app from './server.js';

console.log('Creating serverless-http handler...');
export const handler = serverless(app);
console.log('Handler exported successfully');
