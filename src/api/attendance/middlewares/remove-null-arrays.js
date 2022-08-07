module.exports = () => {
  return async (context, next) => {
    //   if request method is PUT or POST for attendance then remove null arrays from response body
    if (
      context.request.url.includes("/api/attendances") &&
      (context.request.method === "PUT" || context.request.method === "POST")
    ) {
      let requestBody = context.request.body.data;
      if (requestBody.data.length === 0) {
        context.request.body.data.data = null;
      }
    }
    await next();
  };
};
