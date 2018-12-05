const app = require('express')();
const bodyParser = require('body-parser');
const apiRouter = require('./routes/api');
const { handle404, handle422, handle400 } = require('./errors');

app.use(bodyParser.json());

app.use('/api', apiRouter);

app.use('/*', (req, res, next) => {
  next({ status: 404, message: 'page not found' });
});

app.use(handle404);
app.use(handle422);
app.use(handle400);

module.exports = app;
