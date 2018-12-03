const { topicsData } = require('../data/development-data');

exports.seed = function (knex, Promise) {
  // Deletes ALL existing entries
  return knex('topics')
    .del()
    .then(() => knex('topics')
      .insert(topicsData)
      .returning('*'))
    .then(topicRows => console.log(topicRows));
};
