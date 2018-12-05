const articlesRouter = require('express').Router();
const { getArticles, getArticlesByArticleId, addNewVote } = require('../controllers/articles');
const { handle405 } = require('../errors/index');
// .param('param', (req, res, next, param) => {
// check whether param path is valid using conditionals
// if error next({error msg}) and put in error handling
// })

articlesRouter
  .route('/')
  .get(getArticles)
  .all(handle405);

articlesRouter
  .route('/:article_id')
  .get(getArticlesByArticleId)
  .patch(addNewVote)
  .all(handle405);

module.exports = articlesRouter;
