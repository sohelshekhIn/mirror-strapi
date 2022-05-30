module.exports = {
  routes: [
    {
      method: "POST",
      path: "/auth/login",
      handler: "custom.login",
    },
    {
      method: "POST",
      path: "/auth/logout",
      handler: "custom.logout",
    },
  ],
};
