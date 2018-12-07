const ENV = process.env.NODE_ENV || 'development';
const knex = require('knex');

const dbConfig = ENV === 'production'
  ? { client: 'pg', connection: process.env.DATABASE_URL }
  : require('../knexfile')[ENV];

// const dbConfig = require('../knexfile')[ENV];

const connection = knex(dbConfig);
// module.exports = require('knex')(config);

module.exports = connection;
