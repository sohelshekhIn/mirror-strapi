module.exports = [
  "strapi::errors",
  "strapi::security",
  {
    name: "strapi::cors",
    config: {
      enabled: true,
      header: "*",
      origin: [
        "http://localhost:3000",
        "http://localhost:1337",
        "http://localhost:3001",
        "http://192.168.43.30:3000",
        "http://192.168.43.30:3001",
      ],
    },
  },
  "strapi::poweredBy",
  "strapi::logger",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
  "global::TokenSetter",
];
