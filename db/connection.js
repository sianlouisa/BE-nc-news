const ENV = process.env.NODE_ENV || 'development';
const knex = require('knex');

const dbConfig = ENV === 'production'
  ? { client: 'pg', connection: process.env.DATABASE_URL }
  : require('../knexfile')[ENV];

const connection = knex(dbConfig);

module.exports = connection;
