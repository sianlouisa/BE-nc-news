const connection = require('../db/connection');

exports.getCommentsByArticleId = (req, res, next) => {
  const { limit = 10, sort_by = 'created_by', sort_ascending } = req.query;
  connection('comments')
    .select(
      'comment_id',
      'comments.votes',
      'comments.created_at',
      'username AS author',
      'comments.body',
    )
    .where('articles.article_id', req.params.article_id)
    .join('articles', 'articles.article_id', 'comments.article_id')
    .join('users', 'comments.user_id', 'users.user_id')
    .limit(limit)
    .modify((ascQuery) => {
      if (!sort_ascending) ascQuery.orderBy(sort_by, 'desc');
      else ascQuery.orderBy(sort_by, 'asc');
    })
    .then(comments => res.status(200).send(comments))
    .catch(next);
};
