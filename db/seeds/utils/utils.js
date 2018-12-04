exports.createUserLookup = (users) => {
  const lookUpObj = {};
  // refactor with reduce!
  users.forEach((user) => {
    lookUpObj[user.username] = user.user_id;
    return lookUpObj;
  });
  return lookUpObj;
};

exports.formatArticles = (articleData, userLookUp) => {
  const formattedArticles = articleData.map((data) => {
    const date = new Date(data.created_at);
    const newObj = { ...data };
    newObj.created_at = date;
    newObj.created_by = userLookUp[data.created_by];
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
  const lookUp = {};
  // refactor with reduce!
  articles.forEach((article) => {
    lookUp[article.title] = article.article_id;
    return lookUp;
  });
  return lookUp;
};

exports.formatComments = (commentsData, lookUp, userLookUp) => {
  const formattedComments = commentsData.map((data) => {
    const newObj = { ...data };
    const date = new Date(data.created_at);
    newObj.created_at = date;
    newObj.article_id = lookUp[data.belongs_to];
    newObj.user_id = userLookUp[data.created_by];
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
