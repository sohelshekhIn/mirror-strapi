const axios = require("axios");

module.exports = {
  async login(ctx) {
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
      // if error is invalid credentials return 400 with message "Invalid credentials"
      if (
        error.response.status === 400 &&
        error.response.data.error.name === "ValidationError"
      ) {
        return ctx.badRequest(null, {
          messages: {
            id: "invalid_credentials",
            message: "Invalid credentials",
          },
        });
      }
      return ctx.badRequest(error);
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
