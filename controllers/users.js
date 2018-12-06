const connection = require('../db/connection');

exports.getUsers = (req, res, next) => {
  connection('users')
    .select()
    .then(users => res.status(200).send(users))
    .catch(next);
};

exports.getUsersByUserId = (req, res, next) => {
  const { user_id } = req.params;
  connection('users')
    .select()
    .where('user_id', user_id)
    .then(([user]) => res.status(200).send(user))
    .catch(next);
};
