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
  it('ERROR - GET - status:404 client enters invalid path', () => {
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
    it('ERROR - POST - status:422 client entered topic with slug that already exists', () => {
      const topicsURL = '/api/topics';
      const newTopic = { description: 'helllo world', slug: 'cats' };
      return request
        .post(topicsURL)
        .send(newTopic)
        .expect(422)
        .then(({ body }) => {
          expect(body.message).to.equal('the key you have entered already exists');
        });
    });
    it('ERROR - DELETE - status:405 method cannot be accessed on existing route', () => {
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
          .then(({ body }) => {
            expect(body).to.be.an('array');
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
            expect(body[0].comment_count).to.equal('13');
          });
      });
      it('GET - status:200 has a limit query defaulted to 10', () => {
        const URL = '/api/topics/mitch/articles';
        return request
          .get(URL)
          .expect(200)
          .then(({ body }) => {
            expect(body).to.have.length(10);
          });
      });
      it('GET - status:200 responds with correct limit query when altered', () => {
        const URL = '/api/topics/mitch/articles';
        return request
          .get(`${URL}?limit=5`)
          .expect(200)
          .then(({ body }) => {
            expect(body).to.have.length(5);
          });
      });
      it('GET - status:200 has sort by query defaulted to date', () => {
        const URL = '/api/topics/mitch/articles';
        return request
          .get(URL)
          .expect(200)
          .then(({ body }) => {
            expect(body[0].created_at).to.eql('2018-11-15T12:21:54.171Z');
          });
      });
      it('GET - status:200 sort by query can be altered by different columns', () => {
        const URL = '/api/topics/mitch/articles';
        return request
          .get(`${URL}?sort_by=title`)
          .expect(200)
          .then(({ body }) => {
            expect(body[0].title).to.eql('Z');
          });
      });
      it('GET - status:200 has p query to specify which page to start at', () => {
        const URL = '/api/topics/mitch/articles';
        return request
          .get(`${URL}?limit=5&p=2`)
          .expect(200)
          .then(({ body }) => {
            expect(body).to.have.length(5);
            expect(body[0].article_id).to.equal(7);
          });
      });
      it('GET - status:200 has default desc sort ascending query', () => {
        const URL = '/api/topics/mitch/articles';
        return request
          .get(`${URL}?sort_by=title&sort_ascending=true`)
          .expect(200)
          .then(({ body }) => {
            expect(body[0].title).to.eql('A');
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
          .then(({ body }) => {
            expect(body).to.have.all.keys(
              'article_id',
              'title',
              'body',
              'votes',
              'topic',
              'created_by',
              'created_at',
            );
            expect(body.created_by).to.equal(1);
            expect(body.topic).to.equal('mitch');
            expect(body.title).to.eql(newArticle.title);
            expect(body.body).to.eql(newArticle.body);
          });
      });
      it('ERROR - PATCH -status:405 method cannot be accessed on existing route', () => {
        const URL = '/api/topics/mitch/articles';
        return request
          .patch(URL)
          .expect(405)
          .then(({ body }) => {
            expect(body.message).to.equal('invalid method on path');
          });
      });
      it('ERROR - POST - status:400 user id is not an integer', () => {
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
      it('ERROR - POST - status:400 data is missing from post input', () => {
        const URL = '/api/topics/mitch/articles';
        const wrongArticle = {
          body: 'there is no title',
          user_id: 1,
        };
        return request
          .post(URL)
          .send(wrongArticle)
          .expect(400)
          .then(({ body }) => {
            expect(body.message).to.equal('content missing from post');
          });
      });
      it('ERROR - POST - status:422 user id is valid syntax but does not exist', () => {
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
      it('ERROR - GET - status:404 invald path name entered', () => {
        const wrongURL = '/api/topics/mitch/blah';
        return request
          .get(wrongURL)
          .expect(404)
          .then(({ body }) => expect(body.message).to.equal('page not found'));
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
    it('GET - status:200 has defaults limit(10) sort by(date) sort by(desc) p(1) ', () => {
      const URL = '/api/articles';
      return request
        .get(URL)
        .expect(200)
        .then(({ body }) => {
          expect(body).to.have.length(10);
          expect(body[0].created_at).to.equal('2018-11-15T12:21:54.171Z');
        });
    });
    it('GET - status:200 p query can be altered', () => {
      const URL = '/api/articles';
      return request
        .get(`${URL}?limit=3&p=4`)
        .expect(200)
        .then(({ body }) => {
          expect(body).to.have.length(3);
          expect(body[0].article_id).to.equal(10);
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
    it('ERROR - DELETE - status:405 method type not allowed on this path', () => {
      const URL = '/api/articles';
      return request
        .delete(URL)
        .expect(405)
        .then(({ body }) => {
          expect(body.message).to.equal('invalid method on path');
        });
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
            expect(body.comment_count).to.equal('13');
          });
      });
      it('PATCH - status:200 adds an increment vote object', () => {
        const URL = '/api/articles/2';
        const newVote = { inc_votes: 5 };
        return request
          .patch(URL)
          .send(newVote)
          .expect(200)
          .then(({ body }) => {
            expect(body[0].votes).to.equal(5);
          });
      });
      it('PATCH - status:200 adds an decrements vote object', () => {
        const URL = '/api/articles/1';
        const newVote = { inc_votes: -100 };
        return request
          .patch(URL)
          .send(newVote)
          .expect(200)
          .then(({ body }) => {
            expect(body[0].votes).to.equal(0);
          });
      });
      it('DELETE - status:204 deletes post by article id successfully and responds with empty object', () => {
        const URL = '/api/articles/2';
        return request
          .delete(URL)
          .expect(204)
          .then(({ body }) => {
            expect(body).eql({});
          })
          .then(() => request.get('/api/articles').expect(200))
          .then(({ body }) => {
            expect(body).to.have.length(10);
            expect(body[1].article_id).to.equal(3);
          })
          .then(() => request.get(URL).expect(404))
          .then(({ body }) => expect(body.message).to.equal('page not found'));
      });
      it('ERROR - GET - status 404 path is invalid', () => {
        const URL = '/api/articles/5453';
        return request
          .get(URL)
          .expect(404)
          .then(({ body }) => expect(body.message).to.equal('page not found'));
      });
      it('ERROR - POST - status:405 method type not allowed on this path', () => {
        const URL = '/api/articles/3';
        return request
          .post(URL)
          .expect(405)
          .then(({ body }) => expect(body.message).to.equal('invalid method on path'));
      });
      it('ERROR - GET - status:400 responds with error if request made with bad article id', () => {
        const wrongURL1 = '/api/articles/abc';
        const wrongURL2 = '/api/articles/abc123';
        return request
          .get(wrongURL1)
          .expect(400)
          .then(({ body }) => expect(body.message).to.equal('incorrect form for article id'))
          .then(() => request.get(wrongURL2).expect(400))
          .then(({ body }) => expect(body.message).to.equal('incorrect form for article id'));
      });
      it('ERROR - PATCH - status:400 request made with bad article id', () => {
        const wrongURL = '/api/articles/abc';
        const newVote = { inc_votes: -100 };
        return request
          .patch(wrongURL)
          .send(newVote)
          .expect(400)
          .then(({ body }) => expect(body.message).to.equal('incorrect form for article id'));
      });
      it('ERROR - DELETE - status:400 request made with bad article id', () => {
        const wrongURL = '/api/articles/abc';
        return request
          .delete(wrongURL)
          .expect(400)
          .then(({ body }) => expect(body.message).to.equal('incorrect form for article id'));
      });
    });
    describe('/comments', () => {
      it('GET - status:200 responds with array of comments by article id', () => {
        const URL = '/api/articles/1/comments';
        return request
          .get(URL)
          .expect(200)
          .then(({ body }) => {
            expect(body[0]).to.have.all.keys('comment_id', 'votes', 'created_at', 'author', 'body');
          });
      });
      it('GET - status:200 has default queries for limit(10), sort_by(date), sort_ascending(desc)', () => {
        const URL = '/api/articles/1/comments';
        return request
          .get(URL)
          .expect(200)
          .then(({ body }) => {
            expect(body).to.have.length(10);
            expect(body[0].created_at).to.eql('2016-11-22T12:36:03.389Z');
          });
      });
      it('GET - status:200 queries are modifiable', () => {
        const URL = '/api/articles/1/comments';
        return request
          .get(`${URL}?limit=5&sort_by=body&sort_ascending=true`)
          .expect(200)
          .then(({ body }) => {
            expect(body).to.have.length(5);
            expect(body[0].body).to.equal('Ambidextrous marsupial');
          });
      });
      it('GET - status:200 has a page query which is modifiable', () => {
        const URL = '/api/articles/1/comments';
        return request
          .get(`${URL}?limit=3&p=3`)
          .expect(200)
          .then(({ body }) => expect(body[0].comment_id).to.equal(8));
      });
      it('POST - status:201 responds with object of new comment data', () => {
        const newComment = { user_id: 2, body: 'insert interesting opinion here' };
        const URL = '/api/articles/2/comments';
        return request
          .post(URL)
          .send(newComment)
          .expect(201)
          .then(({ body }) => {
            expect(body).to.have.all.keys(
              'comment_id',
              'votes',
              'created_at',
              'user_id',
              'body',
              'article_id',
            );
            expect(body.user_id).to.equal(newComment.user_id);
            expect(body.body).to.equal(newComment.body);
          });
      });
      it('ERROR - DELETE - status:405 method type not allowed on this path', () => {
        const URL = '/api/articles/2/comments';
        return request
          .delete(URL)
          .expect(405)
          .then(({ body }) => {
            expect(body.message).to.equal('invalid method on path');
          });
      });
      it('ERROR - POST - status:400 data is missing from post input', () => {
        const URL = '/api/articles/3/comments';
        const wrongComment = { user_id: 2 };
        return request
          .post(URL)
          .send(wrongComment)
          .expect(400)
          .then(({ body }) => expect(body.message).to.equal('content missing from post'));
      });
      it('ERROR - POST - status:422 user id is valid syntax but does not exist ', () => {
        const URL = '/api/articles/4/comments';
        const invalidID = { user_id: 4534, body: 'lalala' };
        return request
          .post(URL)
          .send(invalidID)
          .expect(422)
          .then(({ body }) => expect(body.message).to.equal('this id does not exist'));
      });
      it('ERROR - POST - status:404 post is correct syntax but path is invalid', () => {
        const wrongURL = '/api/articles/7547564/comments';
        const correctComment = { user_id: 1, body: 'this would work if the article id was right' };
        return request
          .post(wrongURL)
          .send(correctComment)
          .expect(404)
          .then(({ body }) => expect(body.message).to.equal('page not found'));
      });
      it('ERROR - POST - status:400 article id is incorrect format', () => {
        const wrongURL = '/api/articles/hello/comments';
        const correctComment = { user_id: 2, body: 'this will error' };
        return request
          .post(wrongURL)
          .send(correctComment)
          .expect(400)
          .then(({ body }) => expect(body.message).to.equal('incorrect form for article id'));
      });
      it('ERROR - GET - status:404 path is invalid', () => {
        const wrongURL = '/api/articles/2/hello';
        return request
          .get(wrongURL)
          .expect(404)
          .then(({ body }) => expect(body.message).to.equal('page not found'));
      });
      describe('/:comment_id', () => {
        it('PATCH - status:200 accepts new vote count which increments comment vote', () => {
          const URL = '/api/articles/1/comments/3';
          const newVote = { inc_votes: 10 };
          return request
            .patch(URL)
            .send(newVote)
            .expect(200)
            .then(({ body }) => expect(body.votes).to.equal(110));
        });
        it('PATCH - status:200 accepts new vote count which decrements comment vote', () => {
          const URL = '/api/articles/1/comments/2';
          const newVote = { inc_votes: -100 };
          return request
            .patch(URL)
            .send(newVote)
            .expect(200)
            .then(({ body }) => expect(body.votes).to.equal(-86));
        });
        it('DELETE - status:204 successfully deleted comment by comment id', () => {
          const deletionURL = '/api/articles/1/comments/2';
          const allCommentsURL = '/api/articles/1/comments';
          return request
            .get(allCommentsURL)
            .expect(200)
            .then(({ body }) => expect(body[0].comment_id).to.equal(2))
            .then(() => request.delete(deletionURL).expect(204))
            .then(({ body }) => expect(body).to.eql({}))
            .then(() => request.get(allCommentsURL).expect(200))
            .then(({ body }) => expect(body[0].comment_id).to.equal(3))
            .then(() => request.delete(deletionURL).expect(404))
            .then(({ body }) => expect(body.message).to.equal('page not found'));
        });
        it('ERROR - GET - status:405 method type not allowed on this path', () => {
          const URL = '/api/articles/1/comments/1';
          return request
            .get(URL)
            .expect(405)
            .then(({ body }) => {
              expect(body.message).to.equal('invalid method on path');
            });
        });
        it('ERROR - DELETE - status:404 path name is invalid', () => {
          const wrongURL = '/api/articles/1/comments/6545645';
          return request
            .delete(wrongURL)
            .expect(404)
            .then(({ body }) => expect(body.message).to.equal('page not found'));
        });
        it('ERROR - PATCH - status:404 path name is invalid but correct syntax', () => {
          const wrongURL = '/api/articles/4/comments/5345';
          const newVote = { inc_votes: -100 };
          return request
            .patch(wrongURL)
            .send(newVote)
            .expect(404)
            .then(({ body }) => expect(body.message).to.equal('page not found'));
        });
        it('ERROR - PATCH - status:400 data is missing and vote does not increment', () => {
          const URL = '/api/articles/1/comments/2';
          const commentsURL = '/api/articles/1/comments';
          const noData = {};
          return request
            .get(commentsURL)
            .expect(200)
            .then(({ body }) => expect(body[0].votes).to.equal(14))
            .then(() => request
              .patch(URL)
              .send(noData)
              .expect(400))
            .then(({ body }) => expect(body.message).to.equal('incorrect data type entered'))
            .then(() => request.get(commentsURL).expect(200))
            .then(({ body }) => expect(body[0].votes).to.equal(14));
        });
        it('ERROR - PATCH - status:400 data passed contains incorrect data type', () => {
          const URL = '/api/articles/1/comments/2';
          const wrongData = { inc_vote: 'hello' };
          return request
            .patch(URL)
            .send(wrongData)
            .expect(400)
            .then(({ body }) => expect(body.message).to.equal('incorrect data type entered'));
        });
        xit('ERROR - DELETE - status:404 comment id is not the correct syntax', () => {
          const wrongURL = '/api/articles/1/comments/wrong';
          return request
            .delete(wrongURL)
            .expect(404)
            .then(({ body }) => expect(body.message).to.equal('page not found'));
        });
        it('ERROR - DELETE - status:404 comment id is correct syntax but does not exist', () => {
          const wrongURL = '/api/articles/1/comments/4345384';
          return request
            .delete(wrongURL)
            .expect(404)
            .then(({ body }) => expect(body.message).to.equal('page not found'));
        });
        describe('/users', () => {
          it('GET - status:200 and responds with array of user object', () => {
            const URL = '/api/users';
            return request
              .get(URL)
              .expect(200)
              .then(({ body }) => {
                expect(body).to.be.an('array');
                expect(body[0]).to.have.all.keys('user_id', 'username', 'avatar_url', 'name');
              });
          });
          it('ERROR - DELETE - status:405 method not allowed on this path', () => {
            const URL = '/api/users';
            return request
              .delete(URL)
              .expect(405)
              .then(({ body }) => expect(body.message).to.equal('invalid method on path'));
          });
          it('ERROR - PATCH - status:405 method not allowed on this path', () => {
            const URL = '/api/users';
            return request
              .patch(URL)
              .expect(405)
              .then(({ body }) => expect(body.message).to.equal('invalid method on path'));
          });
          it('ERROR - POST - status:405 method not allowed on this path', () => {
            const URL = '/api/users';
            return request
              .post(URL)
              .expect(405)
              .then(({ body }) => expect(body.message).to.equal('invalid method on path'));
          });
          describe('/:user_id', () => {
            it('GET - status:200 gets users by user id and responds with object', () => {
              const URL = '/api/users/2';
              return request
                .get(URL)
                .expect(200)
                .then(({ body }) => {
                  expect(body).to.eql({
                    user_id: 2,
                    username: 'icellusedkars',
                    avatar_url: 'https://avatars2.githubusercontent.com/u/24604688?s=460&v=4',
                    name: 'sam',
                  });
                });
            });
            it('ERROR - GET - status:404 invald path', () => {
              const URL = '/api/users/4543534';
              return request.get(URL).expect(404).then(({ body }) => expect(body.message).to.equal('page not found'));
            });
            it('ERROR - GET - status:400 incorrect user id type', () => {
              const URL = '/api/users/wrong';
              return request.get(URL).expect(400).then(({ body }) => expect(body.message).to.equal('invalid input syntax for integer'));
            });
          });
        });
      });
    });
  });
});
