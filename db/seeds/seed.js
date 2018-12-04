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
      return Promise.all([
        knex('articles')
          .insert(formattedArticles)
          .returning('*'),
        userLookUp,
      ]);
    })
    .then(([articleRows, userLookUp]) => {
      const articleLookUp = createArticleLookUp(articleRows);
      const formattedComments = formatComments(commentData, articleLookUp, userLookUp);
      return knex('comments')
        .insert(formattedComments)
        .returning('*');
    })
    .then(commentRows => commentRows);
};
