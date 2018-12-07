const usersRouter = require('express').Router();
const { getUsers, getUsersByUserId } = require('../controllers/users');
const { handle405 } = require('../errors/index');

usersRouter.param('user_id', (req, res, next, user_id) => {
  const regex = /^\d+$/g;
  if (regex.test(user_id)) next();
  else next({ status: 400, message: 'incorrect form for user id' });
});

usersRouter
  .route('/')
  .get(getUsers)
  .all(handle405);

usersRouter
  .route('/:user_id')
  .get(getUsersByUserId)
  .all(handle405);

module.exports = usersRouter;
