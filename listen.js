const app = require('./app');

const { PORT = 5432 } = process.env;

app.listen(PORT, err => console.log(`listening on ${PORT}`));
