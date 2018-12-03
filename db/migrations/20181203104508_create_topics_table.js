exports.up = function (knex, Promise) {
  return knex.schema.createTable('topics', (topicsTable) => {
    topicsTable.string('description');
    topicsTable.string('slug').primary();
    topicsTable.unique('slug');
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('topics');
};
