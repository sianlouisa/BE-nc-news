const connection = require('../db/connection');

exports.getArticlesByTopic = (req, res, next) => {
  const { topic } = req.params;
  const {
    limit = 10, sort_by = 'created_at', p, sort_ascending,
  } = req.query;
  connection
    .select(
      'title',
      'articles.article_id',
      'articles.topic',
      'articles.created_at',
      'username AS author',
      'articles.votes',
    )
    .from('articles')
    .join('users', 'users.user_id', '=', 'articles.created_by')
    .leftJoin('comments', 'comments.article_id', '=', 'articles.article_id')
    .count('comments.article_id AS comment_count')
    .groupBy('articles.article_id', 'users.username')
    .where('topic', topic)
    .limit(limit)
    .offset(p)
    .modify((ascQuery) => {
      if (!sort_ascending) ascQuery.orderBy(sort_by, 'desc');
      else ascQuery.orderBy(sort_by, 'asc');
    })
    .then((articles) => {
      res.status(200).send(articles);
    })
    .catch(next);
};

exports.postArticleByTopic = (req, res, next) => {
  const newObj = { ...req.body };
  newObj.created_by = newObj.user_id;
  // should this be deleted??
  delete newObj.user_id;
  connection('articles')
    .join('users', 'articles.created_by', 'users.user_id')
    .insert(newObj)
    .returning(['title', 'body', 'created_by AS user_id'])
    .then((article) => {
      res.status(201).send(article);
    });
};

exports.getArticles = (req, res, next) => {
  connection('articles')
    .select(
      'username AS author',
      'title',
      'articles.article_id',
      'articles.votes',
      'articles.created_at',
      'topic',
    )
    .join('users', 'articles.created_by', 'users.user_id')
    .leftJoin('comments', 'articles.article_id', 'comments.article_id')
    .count('comments.article_id AS comment_count')
    .groupBy('articles.article_id', 'users.username')
    .then((articles) => {
      res.status(200).send(articles);
    });
};
