let { COMMON_DB_PASSWORD, COMMON_DB_HOST, DB_USERNAME, DB_PORT, DB_DATABASE } = process.env;

let defaultConfigure = {
    client: 'postgresql',
    connection: {
        user: DB_USERNAME,
        host: COMMON_DB_HOST,
        port: DB_PORT,
        database: DB_DATABASE,
        password: COMMON_DB_PASSWORD,
    },
    pool: {
        min: 0,
        max: 10,
        idleTimeoutMillis: 300000,
    },
    migrations: {
        tableName: "knex_migrations",
        directory: "./migrations/tenant",
        loadExtensions: [".js"]
    },
    seeds: {
        directory: './seeds'
    }

}

module.exports = {
    development: {
      ...defaultConfigure,
    },
    staging: {
      ...defaultConfigure,
    },
    production: {
      ...defaultConfigure,
    },
  };
  