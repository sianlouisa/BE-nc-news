const topicsRouter = require('express').Router();
const { getTopics, postTopic } = require('../controllers/topics');
const { getArticlesByTopic, postArticleByTopic } = require('../controllers/articles');
const { handle405 } = require('../errors/index');

topicsRouter
  .route('/')
  .get(getTopics)
  .post(postTopic)
  .all(handle405);

topicsRouter
  .route('/:topic/articles')
  .get(getArticlesByTopic)
  .post(postArticleByTopic)
  .all(handle405);

module.exports = topicsRouter;
