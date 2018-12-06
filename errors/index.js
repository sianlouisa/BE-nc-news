exports.handle404 = (err, req, res, next) => {
  if (err.constraint === 'comments_article_id_foreign') res.status(404).send({ message: 'page not found' });
  if (err.status === 404) res.status(404).send({ message: err.message });
  else next(err);
};

exports.handle422 = (err, req, res, next) => {
  const codes = {
    23505: 'duplicate key value violates unique constraint',
    23503: 'this id does not exist',
  };
  if (codes[err.code]) res.status(422).send({ message: codes[err.code] });
  else next(err);
};

exports.handle400 = (err, req, res, next) => {
  const codes = { '22P02': 'invalid input syntax for integer' };
  if (codes[err.code]) res.status(400).send({ message: codes[err.code] });
  if (err.status === 400) res.status(400).send({ message: err.message });
  else next();
};

exports.handle405 = (req, res, next) => {
  res.status(405).send({ message: 'invalid method on path' });
};
