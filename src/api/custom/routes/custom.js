module.exports = {
  routes: [
    {
      method: "POST",
      path: "/auth/login",
      handler: "custom.index",
    },
    {
      method: "POST",
      path: "/auth/logout",
      handler: "custom.logout",
    },
  ],
};
