const topicsRouter = require('express').Router();
const { getTopics, postTopic } = require('../controllers/topics');
const { getArticlesByTopic } = require('../controllers/articles');
const { handle405 } = require('../errors/index');

topicsRouter
  .route('/')
  .get(getTopics)
  .post(postTopic);

topicsRouter
  .route('/:topic/articles')
  .get(getArticlesByTopic)
  .all(handle405);

module.exports = topicsRouter;
