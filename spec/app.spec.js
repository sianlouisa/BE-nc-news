process.env.NODE_ENV = 'test';
const { expect } = require('chai');
const app = require('../app');
const request = require('supertest')(app);
const connection = require('../db/connection');

describe('/api', () => {
  beforeEach(() => {
    return connection.migrate
      .rollback()
      .then(() => connection.migrate.latest())
      .then(() => connection.seed.run());
  });
  after(() => {
    connection.destroy();
  });
  it('ERROR - status:404 client enters invalid path', () => {
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
    it('ERROR - status:422 client entered topic with slug that already exists', () => {
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
    it('ERROR - status:405 method cannot be accessed on existing route', () => {
      const URL = '/api/topics';
      return request
        .delete(URL)
        .expect(405)
        .then(({ body }) => {
          expect(body.message).to.equal('invalid method on path');
        });
    });
    describe('/:slug/articles', () => {
      it('GET - status:200 responds with array of article objects for given topic in correct format', () => {
        const URL = '/api/topics/mitch/articles';
        return request
          .get(URL)
          .expect(200)
          .then((res) => {
            expect(res.body[0].topic).to.equal('mitch');
            expect(res.body[0]).to.have.all.keys(
              'author',
              'title',
              'article_id',
              'votes',
              'comment_count',
              'created_at',
              'topic',
            );
          });
      });
      it('GET - status:200 has a limit query defaulted to 10', () => {
        const URL = '/api/topics/mitch/articles';
        return request
          .get(URL)
          .expect(200)
          .then((res) => {
            expect(res.body).to.have.length(10);
          });
      });
      it('GET - status:200 responds with limit query when entered', () => {
        const URL = '/api/topics/mitch/articles';
        return request
          .get(`${URL}?limit=5`)
          .expect(200)
          .then((res) => {
            expect(res.body).to.have.length(5);
          });
      });
      it('GET - status:200 has sort by query defaulted to date', () => {
        const URL = '/api/topics/mitch/articles';
        return request
          .get(URL)
          .expect(200)
          .then((res) => {
            expect(res.body[0]).to.eql({
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
      it('GET - status:200 sort by query can be altered', () => {
        const URL = '/api/topics/mitch/articles';
        return request
          .get(`${URL}?sort_by=title`)
          .expect(200)
          .then((res) => {
            expect(res.body[0].title).to.eql('Z');
          });
      });
      it('GET - status:200 has p query to specify which page to start at', () => {
        const URL = '/api/topics/mitch/articles';
        return request
          .get(`${URL}?p=2&limit=5`)
          .expect(200)
          .then((res) => {
            expect(res.body).to.have.length(5);
            expect(res.body[0].article_id).to.equal(3);
          });
      });
      it('GET - status:200 has default desc sort ascending query', () => {
        const URL = '/api/topics/mitch/articles';
        return request
          .get(`${URL}?sort_by=title&sort_ascending=true`)
          .expect(200)
          .then((res) => {
            expect(res.body[0].title).to.eql('A');
          });
      });
      it('POST - status:201 and responds with posted article object with correct keys', () => {
        const URL = '/api/topics/mitch/articles';
        const newArticle = {
          title: 'article title',
          body: 'this is a very interesting article',
          user_id: 1,
        };
        return request
          .post(URL)
          .send(newArticle)
          .expect(201)
          .then((res) => {
            expect(res.body).to.have.all.keys(
              'article_id',
              'title',
              'body',
              'votes',
              'topic',
              'created_by',
              'created_at',
            );
            expect(res.body.created_by).to.equal(1);
            expect(res.body.topic).to.equal('mitch');
            expect(res.body.title).to.eql(newArticle.title);
            expect(res.body.body).to.eql(newArticle.body);
          });
      });
      it('ERROR - status:405 method cannot be accessed on existing route', () => {
        const URL = '/api/topics/mitch/articles';
        return request
          .patch(URL)
          .expect(405)
          .then(({ body }) => {
            expect(body.message).to.equal('invalid method on path');
          });
      });
      it('ERROR - status:400 user id is not an integer', () => {
        const URL = '/api/topics/mitch/articles';
        const wrongArticle = {
          title: 'fake news',
          body: 'this will error',
          user_id: 'wrong',
        };
        return request
          .post(URL)
          .send(wrongArticle)
          .expect(400)
          .then(({ body }) => {
            expect(body.message).to.equal('invalid input syntax for integer');
          });
      });
      // need to revisit
      xit('ERROR - status:400 data is missing from post input', () => {
        const URL = '/api/topics/mitch/articles';
        const wrongArticle = {
          body: 'there is no title',
          user_id: 1,
        };
        return request
          .post(URL)
          .send(wrongArticle)
          .expect(201)
          .then(() => {});
      });
      it('ERROR - status:422 user id is valid syntax but does not exist', () => {
        const URL = '/api/topics/mitch/articles';
        const wrongID = {
          title: 'lala',
          body: 'who is this user',
          user_id: 43464,
        };
        return request
          .post(URL)
          .send(wrongID)
          .expect(422)
          .then(({ body }) => {
            expect(body.message).to.equal('this id does not exist');
          });
      });
    });
  });
  describe('/articles', () => {
    it('GET - status:200 responds with array of article objects', () => {
      const URL = '/api/articles';
      return request
        .get(URL)
        .expect(200)
        .then(({ body }) => {
          expect(body).to.be.an('array');
          expect(body[0]).to.have.all.keys(
            'author',
            'title',
            'article_id',
            'votes',
            'comment_count',
            'created_at',
            'topic',
          );
        });
    });
    it('GET - status:200 has default limit of 10, sort by date, and sort desc', () => {
      const URL = '/api/articles';
      return request
        .get(URL)
        .expect(200)
        .then(({ body }) => {
          expect(body).to.have.length(10);
          expect(body[0].created_at).to.equal('2018-11-15T12:21:54.171Z');
        });
    });
    it('GET - status:200 has a p query which can set the page number', () => {
      const URL = '/api/articles';
      return request
        .get(`${URL}?limit=5&p=2`)
        .expect(200)
        .then(({ body }) => {
          expect(body).to.have.length(5);
        });
    });
    it('GET - status:200 queries can be modifed', () => {
      const URL = '/api/articles';
      return request
        .get(`${URL}?limit=3&sort_by=title&sort_ascending=true`)
        .expect(200)
        .then(({ body }) => {
          expect(body).to.have.length(3);
          expect(body[0].title).to.equal('A');
        });
    });
    it('ERROR - status:405 method type not allowed on this path', () => {
      const URL = '/api/articles';
      return request
        .delete(URL)
        .expect(405)
        .then(({ body }) => {
          expect(body.message).to.equal('invalid method on path');
        });
    });
    // ERROR HANDLING - 400, 404
  });
  describe('/:article_id', () => {
    it('GET - status:200 gets articles in object by article id', () => {
      const URL = '/api/articles/1';
      return request
        .get(URL)
        .expect(200)
        .then(({ body }) => {
          expect(body).to.be.an('object');
          expect(body).to.have.all.keys(
            'article_id',
            'author',
            'title',
            'votes',
            'body',
            'comment_count',
            'created_at',
            'topic',
          );
          expect(body.article_id).to.equal(1);
        });
    });
    it.only('PATCH - status:200 adds an increment vote object', () => {
      const URL = '/api/articles/1';
      const newVote = { inc_votes: 5 };
      return request
        .patch(URL)
        .send(newVote)
        .expect(200)
        .then(({ body }) => {
          expect(body[0].votes).to.equal(105);
        });
    });
    it.only('PATCH - status:200 adds an decrements vote object', () => {
      const URL = '/api/articles/2';
      const newVote = { inc_votes: -20 };
      return request
        .patch(URL)
        .send(newVote)
        .expect(200)
        .then(({ body }) => {
          expect(body[0].votes).to.equal(-20);
        });
    });
  });
});
