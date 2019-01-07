const express = require('express');
const cors = require('cors');

const app = express();
const bodyParser = require('body-parser');
const apiRouter = require('./routes/api');
const listEndpoints = require('express-list-endpoints');
const { handle404, handle422, handle400 } = require('./errors');

app.use(cors());

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.use(bodyParser.json());

app.get('/', (req, res, next) => {
  res.render('index.ejs');
});

app.use('/api', apiRouter);

app.route('/api').all((req, res, next) => {
  res.status(200).send(listEndpoints(app));
});

app.use('/api/*', (req, res, next) => {
  next({ status: 404, message: 'page not found' });
});

app.use(handle404);
app.use(handle422);
app.use(handle400);

module.exports = app;
