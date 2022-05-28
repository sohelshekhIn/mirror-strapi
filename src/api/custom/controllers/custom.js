const axios = require("axios");

module.exports = {
  async index(ctx) {
    const { body } = ctx.request;
    const hostname = "localhost";
    // const hostname =
    //   strapi.config.environment === "development" &&
    //   ["127.0.0.1", "0.0.0.0"].includes(strapi.config.server.host)
    //     ? "localhost"
    //     : strapi.config.server.host;
    const absoluteURL = `http://${hostname}:${strapi.config.server.port}`;
    const sanitizeOutput = (user) => {
      const {
        password,
        resetPasswordToken,
        confirmationToken,
        ...sanitizedUser
      } = user;
      return sanitizedUser;
    };

    try {
      console.log("Tryin to login");
      let { data } = await axios.post(`${absoluteURL}/api/auth/local`, body);

      const populatedUser = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        data.user.id,
        {
          populate: {
            role: {
              fields: ["type"],
            },
          },
        }
      );
      data.user = sanitizeOutput(populatedUser);
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
