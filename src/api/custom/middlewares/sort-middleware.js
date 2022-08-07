module.exports = () => {
  return async (context, next) => {
    await next();
    if (context.request.url.includes("/api/info/attendance/students")) {
      let responseBody = context.response.body;
      // check if any error in responseBody if yes then return responseBody
      if (responseBody.error) {
        return;
      }
      // sort responseBody by name
      context.response.body = responseBody.sort((a, b) => {
        return a.name.localeCompare(b.name, undefined, {
          numeric: false,
          sensitivity: "base",
        });
      });
    } else if (context.request.url.includes("/api/data/students/view")) {
      let responseBody = context.response.body;
      // check if any error in responseBody if yes then return responseBody
      if (responseBody.error) {
        return;
      }
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
