exports.getArticlesByTopic = (req, res, next) => {
  //   responds with an array of article objects for a given topic
  // each article should have:
  // author which is the username from the users table,
  // title
  // article_id
  // votes
  // comment_count which is the accumulated count of all the comments with this article_id. You should make use of knex queries in order to achieve this.
  // created_at
  // topic
  //   Queries
  // This route should accept the following queries:
  // limit, which limits the number of responses (defaults to 10)
  // sort_by, which sorts the articles by any valid column (defaults to date)
  // p, stands for page which specifies the page at which to start (calculated using limit)
  // sort_ascending, when "true" returns the results sorted in ascending order (defaults to descending)
};

exports.postArticlesByTopic = (req, res, next) => {};
