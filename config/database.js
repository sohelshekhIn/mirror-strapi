// strapi-api/config/database.js
// module.exports = ({ env }) => ({
//   connection: {
//     client: "postgres",
//     connection: {
//       host: env("DATABASE_HOST", "tiny.db.elephantsql.com"),
//       port: env.int("DATABASE_PORT", 5432),
//       database: env("DATABASE_NAME", "psidtohv"),
//       user: env("DATABASE_USERNAME", "psidtohv"),
//       password: env("DATABASE_PASSWORD", "Oicmv2ykMobrrcJD9COXO36i5ktG0KQu"),
//       schema: env("DATABASE_SCHEMA", "public"),
//     },
//     debug: false,
//   },
// });

module.exports = ({ env }) => ({
  connection: {
    client: "postgres",
    connection: {
      host: env("DATABASE_HOST", "localhost"),
      port: env.int("DATABASE_PORT", 5432),
      database: env("DATABASE_NAME", "mirror"),
      user: env("DATABASE_USERNAME", "postgres"),
      password: env("DATABASE_PASSWORD", "root"),
      schema: env("DATABASE_SCHEMA", "public"),
    },
    debug: false,
  },
});
