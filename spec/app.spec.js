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
  it('GET - status:404 client enters invalid path', () => {
    return request
      .get('/api/hello')
      .expect(404)
      .then(({ body }) => {
        expect(body.message).to.eql('page not found');
      });
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
    it('POST - status:201 and responds with posted topic object', () => {
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
    it('POST - status:422 client entered topic with slug that already exists', () => {
      const topicsURL = '/api/topics';
      const newTopic = { description: 'helllo world', slug: 'cats' };
      return request
        .post(topicsURL)
        .send(newTopic)
        .expect(422)
        .then(({ body }) => {
          expect(body.message).to.equal('duplicate key value violates unique constraint');
        });
    });
    it('GET - status:200 responds with array of article objects for given topic in correct format', () => {
      const URL = '/api/topics/mitch/articles';
      return request
        .get(URL)
        .expect(200)
        .then(({ body }) => {
          expect(body[0].topic).to.equal('mitch');
          expect(body[0]).to.have.all.keys(
            'author',
            'title',
            'article_id',
            'votes',
            'comment_count',
            'created_at',
            'topic',
          );
          expect(body[0]).to.eql({
            title: 'Living in the shadow of a great man',
            article_id: 1,
            topic: 'mitch',
            created_at: '2018-11-15T12:21:54.171Z',
            author: 'butter_bridge',
            votes: 100,
            comment_count: '13',
          });
        });
    });
  });
});
