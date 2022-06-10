const { createCoreController } = require("@strapi/strapi").factories;
module.exports = createCoreController("api::global.global", ({ strapi }) => ({
  async getData(ctx) {
    try {
      ctx.body = await strapi.entityService.findMany("api::global.global", {
        populate: {
          NavLinks: {},
          NavLoginButton: {},
          Footer: {
            populate: {
              leftLogo: {
                fields: ["url", "width", "height"],
              },
            },
          },
          FooterColumns: {
            populate: ["FooterLinks"],
          },
          FooterCredits: {},
        },
      });
    } catch (err) {
      ctx.body = err;
    }
  },
}));
