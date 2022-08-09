module.exports = () => {
  return async (context, next) => {
    await next();
    if (
      context.request.url.includes("/api/attendances") &&
      context.request.method === "PUT"
    ) {
      // check if response was successful
      if (context.response.status === 200) {
        let response = context.response.body.data;
        let reasonDataStatus = response.attributes.reasonDataStatus;
        if (reasonDataStatus === "verified") {
          for (
            let i = 0;
            i < Object.keys(response.attributes.reasonData).length;
            i++
          ) {
            let UserID = Object.keys(response.attributes.reasonData)[i];
            try {
              let date = response.attributes.AttendanceId.split("_")[1];
              const studentContactData = await strapi.entityService.findMany(
                "api::student-detail.student-detail",
                {
                  fields: ["UserID", "msgMobile"],
                  filters: { UserID: UserID },
                }
              );
              const studentData = await strapi.entityService.findMany(
                "plugin::users-permissions.user",
                {
                  fields: ["UserID", "name"],
                  filters: { UserID: UserID },
                }
              );

              let smsResponse = strapi
                .service("api::custom.send-sms")
                .send(studentContactData[0].msgMobile, "t-att", [
                  studentData[0].name,
                  date,
                ]);
              console.log(smsResponse);
            } catch (error) {
              console.log(error);
            }
          }
        }
      }
    }
  };
};
