## Northcoders News API

### Background

The back-end of my Northcoders Newsboard.

A RESTful API built with Node.js and Express.js. The database ues PSQL and it can be interacted with using [Knex](https://knexjs.org).

## Prerequisites

You will need [PSQL](https://www.postgresql.org/download/) and [KNEX](https://knexjs.org/#Installation) installed. Follow the relevant links for instructions on how to install these.

Use the following commands in your terminal to install dependencies:

```http
npm i
```

```http
npx i knex
```

Once installed, locate the knexfile.js and change the username and password to your PSQL login details if using Linux, or remove if using Mac as they wil not be required. See below for an example of how these settings should look.

```http
module.exports = {
  development: {
    client: 'pg',
    connection: {
      database: 'news_db',
      user: 'USERNAME,
      password: 'PASSWORD',
    },
    migrations: {
      directory: './db/migrations',
    },
    seeds: {
      directory: './db/seed',
    },
  }
};
```

In order to roll back the migrations, re-run and seed the database you can use the following command in the terminal:

```http
npm run seed:run
```

Once seeded you can run the server by using the following command in the terminal:

```http
npm run dev
```

Put this address in your browser to see all available endpoints on the API

```http
localhost:9090/api
```

## Endpoints

Endpoints and available requests:

```http
  {
    "path": "/api/topics",
    "methods": [
      "GET",
      "POST"
    ]
  },
  {
    "path": "/api/topics/:topic/articles",
    "methods": [
      "GET",
      "POST"
    ]
  },
  {
    "path": "/api/articles",
    "methods": [
      "GET"
    ]
  },
  {
    "path": "/api/articles/:article_id",
    "methods": [
      "GET",
      "PATCH",
      "DELETE"
    ]
  },
  {
    "path": "/api/articles/:article_id/comments",
    "methods": [
      "GET",
      "POST"
    ]
  },
  {
    "path": "/api/articles/:article_id/comments/:comment_id",
    "methods": [
      "PATCH",
      "DELETE"
    ]
  },
  {
    "path": "/api/users",
    "methods": [
      "GET"
    ]
  },
  {
    "path": "/api/users/:user_id",
    "methods": [
      "GET"
    ]
  },
  {
    "path": "/api",
    "methods": [

    ]
  }
```

## Testing

This API was tested with mocha, chai and supertest. To run all tests use the following command. You do not need to install anything additional for this.

```http
npm t
```
