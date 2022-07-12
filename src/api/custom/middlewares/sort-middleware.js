module.exports = () => {
  return async (context, next) => {
    await next();
    if (context.request.url.includes("/api/info/attendance/students")) {
      let responseBody = context.response.body;
      // sort responseBody by name
      context.response.body = responseBody.sort((a, b) => {
        return a.name.localeCompare(b.name, undefined, {
          numeric: false,
          sensitivity: "base",
        });
      });
    } else if (context.request.url.includes("/api/data/students/view")) {
      let responseBody = context.response.body;
      // sort responseBody by batch
      context.response.body = responseBody.sort((a, b) => {
        return a.name.localeCompare(b.name, undefined, {
          numeric: false,
          sensitivity: "base",
        });
      });
    }
  };
};
