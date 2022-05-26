const axios = require("axios");

module.exports = {
  // GET /auth/cookielogin
  async index(ctx) {
    // Capture the request body (identifier and password)
    const { body } = ctx.request;

    // Build Strapi's Absolute Server URL.
    // Copied from https://github.com/strapi/strapi/blob/86e0cf0f55d58e714a67cf4daee2e59e39974dd9/packages/strapi-utils/lib/config.js#L62
    const hostname = "localhost";
    // const hostname =
    //   strapi.config.environment === "development" &&
    //   ["127.0.0.1", "0.0.0.0"].includes(strapi.config.server.host)
    //     ? "localhost"
    //     : strapi.config.server.host;
    const absoluteURL = `http://${hostname}:${strapi.config.server.port}`;

    try {
      console.log("Tryin to login");
      // Now submit the credentials to Strapi's default login endpoint
      const { data } = await axios.post(`${absoluteURL}/api/auth/local`, body);
      // Set the secure cookie
      if (data && data.jwt) {
        ctx.cookies.set("jwt", data.jwt, {
          httpOnly: true,
          secure: false,
          maxAge: 1000 * 60 * 60 * 24 * 14, // 14 Day Age
          domain: "localhost",
        });
      }

      // Respond with the jwt + user data, but now this response also sets the JWT as a secure cookie
      return ctx.send(data);
    } catch (error) {
      console.log("An error occurred:", error.response);
      return ctx.badRequest(null, error);
    }
  },

  async logout(ctx) {
    ctx.cookies.set("jwt", null);
    ctx.send({
      authorized: true,
      message: "Successfully destroyed session",
    });
  },
};
