const moment = require('moment');

exports.createUserLookup = (users) => {
  const lookUpObj = {};
  users.forEach((user) => {
    lookUpObj[user.username] = user.user_id;
    return lookUpObj;
  });
  return lookUpObj;
};

exports.formatArticles = (articleData, lookUp) => {
  const formattedArticles = articleData.map((data) => {
    const date = moment(data.created_at).format('DD-MM-YYYY h:mm:ss');
    data.created_at = date;
    data.created_by = lookUp[data.created_by];
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

exports.formatComments = (commentsData, lookUp, articleData) => {
  const formattedComments = commentsData.map((data) => {
    const date = moment(data.created_at).format('DD-MM-YYYY h:mm:ss');
    data.created_at = date;
    data.article_id = lookUp[data.belongs_to];
    // This needs to go!!! \/
    articleData.forEach((article) => {
      data.user_id = article.created_by;
    });
    delete data.belongs_to;
    delete data.created_by;
    return data;
  });
  return formattedComments;
};
