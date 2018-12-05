const articlesRouter = require('express').Router();
const {
  getArticles,
  getArticlesByArticleId,
  addNewVote,
  deleteArticleByArticleId,
} = require('../controllers/articles');
const { handle405 } = require('../errors/index');

articlesRouter
  .route('/')
  .get(getArticles)
  .all(handle405);

articlesRouter.param('article_id', (req, res, next, article_id) => {
  const regex = /(\d)+/g;
  if (regex.test(article_id)) next();
  else next({ status: 400, message: 'incorrect form for article id' });
});

articlesRouter
  .route('/:article_id')
  .get(getArticlesByArticleId)
  .patch(addNewVote)
  .delete(deleteArticleByArticleId)
  .all(handle405);

module.exports = articlesRouter;
