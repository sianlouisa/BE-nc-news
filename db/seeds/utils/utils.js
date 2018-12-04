const moment = require('moment');

exports.createUserLookup = (users) => {
  const lookUpObj = {};
  users.forEach((user) => {
    lookUpObj[user.username] = user.user_id;
    return lookUpObj;
  });
  return lookUpObj;
};

exports.formatArticles = (articleData, userLookUp) => {
  const formattedArticles = articleData.map((data) => {
    const date = moment(data.created_at).format('DD-MM-YYYY h:mm:ss');
    data.created_at = date;
    data.created_by = userLookUp[data.created_by];
    return data;
  });
  return formattedArticles;
};

exports.createArticleLookUp = (articles) => {
  const lookUp = {};
  articles.forEach((article) => {
    lookUp[article.title] = article.article_id;
    return lookUp;
  });
  return lookUp;
};

exports.formatComments = (commentsData, lookUp, userLookUp) => {
  const formattedComments = commentsData.map((data) => {
    const date = moment(data.created_at).format('DD-MM-YYYY h:mm:ss');
    data.created_at = date;
    data.article_id = lookUp[data.belongs_to];
    data.user_id = userLookUp[data.created_by];
    // Revist deletions
    delete data.belongs_to;
    delete data.created_by;
    return data;
  });
  return formattedComments;
};
