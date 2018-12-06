const connection = require('../db/connection');

exports.getCommentsByArticleId = (req, res, next) => {
  const {
    limit = 10, sort_by = 'created_by', sort_ascending, p = 1,
  } = req.query;
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
    .offset((p - 1) * limit)
    .modify((ascQuery) => {
      if (!sort_ascending) ascQuery.orderBy(sort_by, 'desc');
      else ascQuery.orderBy(sort_by, 'asc');
    })
    .then((comments) => {
      if (typeof comments === 'undefined') next({ status: 404, message: 'page not found' });
      else res.status(200).send(comments);
    })
    .catch(next);
};

exports.postCommentOnArticle = (req, res, next) => {
  const cloneObj = { ...req.body, ...req.params };
  cloneObj.created_by = cloneObj.user_id;
  const {
    comment_id, votes, created_at, user_id, body, article_id,
  } = cloneObj;
  const newObj = {
    comment_id,
    votes,
    created_at,
    user_id,
    body,
    article_id,
  };
  // if input is missing from post
  if (Object.keys(req.body).length <= 1) {
    next({ status: 400, message: 'content missing from post' });
  }
  return connection('comments')
    .join('articles', 'articles.article_id', 'comments.article_id')
    .join('users', 'users.user_id', 'comments.user_id')
    .insert(newObj)
    .returning('*')
    .then(([newComment]) => {
      if (newComment.length <= 0) next({ status: 404, message: 'page not found' });
      else res.status(201).send(newComment);
    })
    .catch(next);
};

exports.addNewCommentVote = (req, res, next) => {
  const { inc_votes } = req.body;
  const { comment_id } = req.params;
  connection('comments')
    .where('comment_id', comment_id)
    .modify((voteQuery) => {
      if (Object.keys(req.body).length <= 0) next({ status: 400, message: 'content missing from post' });
      else voteQuery.increment('votes', inc_votes);
    })
    .returning('*')
    .then(([commentWithNewVote]) => {
      if (typeof commentWithNewVote === 'undefined') next({ status: 404, message: 'page not found' });
      else res.status(200).send(commentWithNewVote);
    })
    .catch(next);
};

exports.deleteCommentByCommentId = (req, res, next) => {
  const { comment_id } = req.params;
  return connection('comments')
    .select()
    .where('comment_id', comment_id)
    .del()
    .returning('*')
    .then((deletedComment) => {
      if (deletedComment.length <= 0) next({ status: 404, message: 'page not found' });
      else res.status(204).send({});
    })
    .catch(next);
};
