const app = require('./app');

const { PORT = 3000 } = process.env;

// 5432

// eslint-disable-next-line no-console
app.listen(PORT, err => console.log(`listening on ${PORT}`));
