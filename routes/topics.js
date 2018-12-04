const topicsRouter = require('express').Router();
const { getTopics, postTopic } = require('../controllers/topics');
const { getArticlesByTopic, postArticlesByTopic } = require('../controllers/articles');

topicsRouter
  .route('/')
  .get(getTopics)
  .post(postTopic);

topicsRouter
  .route('/:topic/articles')
  .get(getArticlesByTopic)
  .post(postArticlesByTopic);

module.exports = topicsRouter;
