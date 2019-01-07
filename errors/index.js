exports.handle404 = (err, req, res, next) => {
  const codes = { '22P02': 'page not found' };
  if (codes[err.code]) res.status(404).send({ message: codes[err.code] });
  if (err.constraint === 'comments_article_id_foreign' || err.status === 404) res.status(404).send({ message: 'page not found' });
  else next(err);
};

exports.handle422 = (err, req, res, next) => {
  const codes = {
    23505: 'the topic you have entered already exists',
    23503: 'this user id does not exist',
  };
  if (codes[err.code]) res.status(422).send({ message: codes[err.code] });
  else next(err);
};

exports.handle400 = (err, req, res, next) => {
  const codes = { 42703: 'this column does not exist', 23502: 'missing data from post' };
  if (err.status === 400) res.status(400).send({ message: err.message });
  if (codes[err.code]) res.status(400).send({ message: codes[err.code] });
  else next();
};

exports.handle405 = (req, res, next) => {
  res.status(405).send({ message: 'invalid method on path' });
};
