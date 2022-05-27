module.exports = () => {
  return async (ctx, next) => {
    const cookies = ctx.request.header.cookie;
    let token = cookies
      .split(";")
      .find((c) => c.trim().startsWith("jwt="))
      .split("=")[1];
    if (token) {
      // set the token in the request header as Authorization
      ctx.request.header.authorization = `Bearer ${token}`;
    }
    await next();
  };
};
