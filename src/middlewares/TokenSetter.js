module.exports = () => {
  return async (ctx, next) => {
    const cookies = ctx.request.header.cookie || false;
    if (
      cookies &&
      cookies.split(";").find((c) => c.trim().startsWith("jwt="))
    ) {
      let token = cookies
        .split(";")
        .find((c) => c.trim().startsWith("jwt="))
        .split("=")[1];
      if (token) {
        ctx.request.header.authorization = `Bearer ${token}`;
      }
    }
    await next();
  };
};
