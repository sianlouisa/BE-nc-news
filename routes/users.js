const usersRouter = require('express').Router();
const { getUsers, getUsersByUserId } = require('../controllers/users');
const { handle405 } = require('../errors/index');

usersRouter
  .route('/')
  .get(getUsers)
  .all(handle405);

usersRouter
  .route('/:user_id')
  .get(getUsersByUserId)
  .all(handle405);

module.exports = usersRouter;
