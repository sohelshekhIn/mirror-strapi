module.exports = {
  routes: [
    {
      method: "POST",
      path: "/auth/cookielogin",
      handler: "custom.index",
    },
    {
      method: "POST",
      path: "/logout",
      handler: "custom.logout",
    },
  ],
};
