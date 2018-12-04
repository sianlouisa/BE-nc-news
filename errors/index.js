exports.handle404 = (err, req, res, next) => {
  console.log(err);
  if (err.status === 404) res.status(404).send({ message: err.message });
  else next(err);
};

exports.handle422 = (err, req, res, next) => {
  const codes = { 23505: 'duplicate key value violates unique constraint' };
  if (codes[err.code]) res.status(422).send({ message: codes[err.code] });
  else next(err);
};
