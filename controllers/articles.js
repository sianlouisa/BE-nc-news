const connection = require('../db/connection');

// refactor with getArticlesByTopic to avoid DRY
// call this one first
exports.getArticles = (req, res, next) => {
  const {
    limit = 10, sort_by = 'created_at', sort_ascending, p = 1,
  } = req.query;
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
    .modify((ascQuery) => {
      if (!sort_ascending) ascQuery.orderBy(sort_by, 'desc');
      else ascQuery.orderBy(sort_by, 'asc');
    })
    .limit(limit)
    .offset((p - 1) * limit)
    .then((articles) => {
      if (typeof articles === 'undefined') next({ status: 404, message: 'page not found' });
      else res.status(200).send(articles);
    })
    .catch(next);
};

exports.getArticlesByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  if (!article_id) {
    return next({ status: 404, message: 'page not found' });
  }
  return connection
    .select(
      'articles.article_id',
      'username AS author',
      'title',
      'articles.votes',
      'articles.body',
      'articles.created_at',
      'topic',
    )
    .from('articles')
    .where('articles.article_id', article_id)
    .join('users', 'created_by', 'user_id')
    .join('comments', 'articles.article_id', 'comments.article_id')
    .count('comments.article_id AS comment_count')
    .groupBy('articles.article_id', 'users.username')
    .then(([articles]) => {
      if (typeof articles === 'undefined') next({ status: 404, message: 'page not found' });
      else res.status(200).send(articles);
    })
    .catch(next);
};

exports.getArticlesByTopic = (req, res, next) => {
  const { topic } = req.params;
  const {
    limit = 10, sort_by = 'created_at', p = 1, sort_ascending,
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
    .offset((p - 1) * limit)
    .modify((ascQuery) => {
      if (!sort_ascending) ascQuery.orderBy(sort_by, 'desc');
      else ascQuery.orderBy(sort_by, 'asc');
    })
    .then(articles => res.status(200).send(articles))
    .catch(next);
};

exports.postArticleByTopic = (req, res, next) => {
  const cloneObj = { ...req.body, ...req.params };
  cloneObj.created_by = cloneObj.user_id;
  const {
    title, created_by, body, topic,
  } = cloneObj;
  const newObj = {
    title,
    created_by,
    body,
    topic,
  };
  if (Object.keys(req.body).length <= 2) {
    return next({ status: 400, message: 'content missing from post' });
  }
  return connection('articles')
    .join('users', 'articles.created_by', 'users.user_id')
    .insert(newObj)
    .returning('*')
    .then(([article]) => {
      res.status(201).send(article);
    })
    .catch(next);
};

exports.addNewArticleVote = (req, res, next) => {
  const { inc_votes } = req.body;
  connection('articles')
    .where('article_id', req.params.article_id)
    .increment('votes', inc_votes)
    .returning('*')
    .then((articleWithNewVote) => {
      res.status(200).send(articleWithNewVote);
    })
    .catch(next);
};

exports.deleteArticleByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  return (
    connection('articles')
      .select()
      .where('article_id', article_id)
      // revisit this
      .del()
      .then(() => {
        res.status(200).send({});
      })
      .catch(next)
  );
};
