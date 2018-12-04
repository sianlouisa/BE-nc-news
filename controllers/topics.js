const connection = require('../db/connection');

exports.getTopics = (req, res, next) => {
  connection
    .select()
    .from('topics')
    .then(topics => res.status(200).send({ topics }))
    .catch(next);
};

exports.postTopic = (req, res, next) => {
  connection('topics')
    .insert(req.body)
    .returning('*')
    .then(([topic]) => res.status(201).send({ topic }))
    .catch(next);
};
