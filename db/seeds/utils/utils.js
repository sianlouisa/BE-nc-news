exports.createUserLookup = (users) => {
  const userLookUp = users.reduce((newObj, user) => {
    newObj[user.username] = user.user_id;
    return newObj;
  }, {});
  return userLookUp;
};

exports.formatArticles = (articleData, userLookUp) => {
  const formattedArticles = articleData.map((article) => {
    const date = new Date(article.created_at);
    const newObj = { ...article };
    newObj.created_at = date;
    newObj.created_by = userLookUp[article.created_by];
    const {
      article_id, title, body, votes, topic, created_by, created_at,
    } = newObj;
    return {
      article_id,
      title,
      body,
      votes,
      topic,
      created_by,
      created_at,
    };
  });
  return formattedArticles;
};

exports.createArticleLookUp = (articles) => {
  const articleLookUp = articles.reduce((newObj, article) => {
    newObj[article.title] = article.article_id;
    return newObj;
  }, {});
  return articleLookUp;
};

exports.formatComments = (commentsData, lookUp, userLookUp) => {
  const formattedComments = commentsData.map((comment) => {
    const newObj = { ...comment };
    const date = new Date(comment.created_at);
    newObj.created_at = date;
    newObj.article_id = lookUp[comment.belongs_to];
    newObj.user_id = userLookUp[comment.created_by];
    const {
      comment_id, user_id, article_id, votes, created_at, body,
    } = newObj;
    return {
      comment_id,
      user_id,
      article_id,
      votes,
      created_at,
      body,
    };
  });
  return formattedComments;
};
