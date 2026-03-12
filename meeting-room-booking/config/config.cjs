// This configuration file is used by Sequelize CLI.
// Unlike the static config.json, this JavaScript version allows us to
// load environment variables from the .env file using dotenv.
require('dotenv').config();

module.exports = {
  development: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
  },
  test: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
  },
};
