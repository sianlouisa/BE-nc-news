const articlesRouter = require('express').Router();
const { getArticles } = require('../controllers/articles');

articlesRouter.route('/').get(getArticles);

module.exports = articlesRouter;
