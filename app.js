const app = require('express')();
const bodyParser = require('body-parser');
const apiRouter = require('./routes/api');

app.use(bodyParser.json());

app.use('/api', apiRouter);

app.use((err, req, res, next) => {
  if (err) console.log(err);
});

module.exports = app;
