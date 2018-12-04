process.env.NODE_ENV = 'test';
const { expect } = require('chai');
const app = require('../app');
const request = require('supertest')(app);
const connection = require('../db/connection');

describe('/api', () => {
  beforeEach(() => connection.migrate
    .rollback()
    .then(() => connection.migrate.latest())
    .then(() => connection.seed.run()));
  after(() => {
    connection.destroy();
  });
  describe('/topics', () => {
    it('GET - status:200 returns array of topics objects', () => {
      const topicsURL = '/api/topics';
      return request
        .get(topicsURL)
        .expect(200)
        .then(({ body }) => {
          expect(body.topics).to.be.an('array');
          expect(body.topics[0]).to.have.all.keys('description', 'slug');
          expect(body.topics[0].description).to.equal('The man, the Mitch, the legend');
        });
    });
    it.only('POST - status:201 and responds with posted topic object', () => {
      const topicsURL = '/api/topics';
      const newTopic = { description: 'what is really fluffy', slug: 'chinchillas' };
      return request
        .post(topicsURL)
        .send(newTopic)
        .expect(201)
        .then(({ body }) => {
          expect(body.topic).to.eql(newTopic);
        });
    });
  });
});
