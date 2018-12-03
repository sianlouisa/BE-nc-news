const {
  topicData, userData, articleData, commentData,
} = require('../data/test-data');
const {
  formatArticles,
  createUserLookup,
  createArticleLookUp,
  formatComments,
} = require('./utils/utils');

exports.seed = function (knex, Promise) {
  return Promise.all([
    knex('topics').del(),
    knex('users').del(),
    knex('articles').del(),
    knex('comments').del(),
  ])
    .then(() => knex('topics')
      .insert(topicData)
      .returning('*'))
    .then(() => knex('users')
      .insert(userData)
      .returning('*'))
    .then((userRows) => {
      const userLookUp = createUserLookup(userRows);
      const formattedArticles = formatArticles(articleData, userLookUp);
      return knex('articles')
        .insert(formattedArticles)
        .returning('*');
    })
    .then((articleRows) => {
      const articleLookUp = createArticleLookUp(articleRows);
      const formattedComments = formatComments(commentData, articleLookUp, articleRows);
      return knex('comments')
        .insert(formattedComments)
        .returning('*');
    })
    .then((commentRows) => {
      console.log(commentRows);
    });
};
