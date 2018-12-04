const connection = require('../db/connection');

exports.getArticlesByTopic = (req, res, next) => {
  const { topic } = req.params;
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
    .join('comments', 'comments.article_id', '=', 'articles.article_id')
    .count('comments.article_id AS comment_count')
    .groupBy('articles.article_id', 'users.username')
    .where('topic', topic)
    .then((articles) => {
      res.status(200).send(articles);
    })
    .catch(next);
};

// exports.postArticlesByTopic = (req, res, next) => {};
