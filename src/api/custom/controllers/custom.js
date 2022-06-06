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

  async GetStudents(ctx) {
    const studBatch = ctx.request.body.data.batch;
    const students = await strapi.entityService.findMany(
      "plugin::users-permissions.user",
      {
        filters: {
          role: {
            type: "student",
          },
          batch: {
            batch: studBatch,
          },
        },
        fields: ["name", "UserID"],
      }
    );
    console.log(students);
    return ctx.send(students);
  },

  // check attendance of student
  async checkAttendance(ctx) {
    // get ?batch=batch from url
    const batch = ctx.request.query.batch;
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, "0");
    let mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    let yyyy = today.getFullYear();
    today = dd + "/" + mm + "/" + yyyy;
    const attendanceId = batch.replace(/\s/g, "") + "_" + today;

    // find attendance in attendance table with AttendanceId
    const attendance = await strapi.entityService.findMany(
      "api::attendance.attendance",
      {
        filters: {
          AttendanceId: attendanceId,
        },
      }
    );
    // if attendance is found return attendance, else return with found = false
    if (attendance.length > 0) {
      return ctx.send(attendance);
    }
    return ctx.send({ found: false });
  },
};
