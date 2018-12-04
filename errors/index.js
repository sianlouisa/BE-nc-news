exports.handle404 = (err, res, req, next) => {
  if (err.status === 404) res.status(404).send(err.message);
};
