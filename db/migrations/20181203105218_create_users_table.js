exports.up = function (knex, Promise) {
  return knex.schema.createTable('users', (usersTable) => {
    usersTable.increments('user_id').primary();
    usersTable.string('username');
    usersTable.string('avatar_url');
    usersTable.string('name');
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('users');
};
