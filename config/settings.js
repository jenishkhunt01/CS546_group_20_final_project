
require('dotenv').config();

export const mongoConfig = {
  serverUrl: process.env.MONGO_SERVER_URL || 'mongodb://localhost:27017/',
  database: process.env.MONGO_DB_NAME || 'rideSharingDB',
};
export const sessionSecret = process.env.SESSION_SECRET || 'your_session_secret_here';