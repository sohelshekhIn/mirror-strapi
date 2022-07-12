module.exports = () => {
  return async (context, next) => {
    await next();
    if (
      context.request.url === "/api/batches?fields[0]=batch&fields[1]=subjects"
    ) {
      let responseBody = context.response.body.data;
      context.response.body.data = responseBody.sort((a, b) => {
        return a.attributes.batch.localeCompare(b.attributes.batch, undefined, {
          numeric: true,
          sensitivity: "base",
        });
      });
    }
  };
};
