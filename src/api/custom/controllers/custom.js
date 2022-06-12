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
            batch: {
              fields: ["batch"],
            },
          },
        }
      );
      data.user = sanitizeOutput(populatedUser);
      return ctx.send(data);
    } catch (error) {
      console.log(error);
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
    const studBatch = ctx.request.query.batch;
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

  // get attendance of a student
  async getStudentAttendance(ctx) {
    let { batch, id } = ctx.request.query;
    batch = batch.replace(/\s/g, "") + "_";

    // for every record in attendance table
    const attendance = await strapi.entityService.findMany(
      "api::attendance.attendance",
      {
        filters: {
          AttendanceId: {
            $contains: batch,
          },
        },
      }
    );

    let attendances = {};
    let foundData = true;
    if (attendance === undefined) {
      return ctx.badRequest(null, {
        message: "No Batch Found",
      });
    }
    for (let key in attendance) {
      if ((attendance[key].data.indexOf(id) === -1) === true) {
        foundData = false;
      } else {
        foundData = true;
      }
      attendances[attendance[key].AttendanceId.split("_")[1]] = {
        method: attendance[key].attendanceMethod,
        found: foundData,
      };
    }
    return ctx.send(attendances);
  },

  // add student data to Users Table and Student Details Table
  async registerStudent(ctx) {
    const bodyData = ctx.request.body.data;
    console.log(bodyData);
    const startTime = new Date();
    // Generate unique UserID for student
    const generateUserId = () => {
      return "ST" + Math.floor(Math.random() * 1000000);
    };
    const UserIdChecker = async (userId) => {
      // Probablity of getting same UserID is low, so we need to check if UserID already exists
      let user = await strapi.entityService.findMany(
        "plugin::users-permissions.user",
        {
          filters: {
            UserID: userId,
          },
        }
      );
      return user;
    };

    // Generate unique UserID
    // What is the probability of a user ID being generated twice?
    // It's very low, but it's possible.
    // So we'll just keep trying until we get a unique one.
    let userId = generateUserId();
    let existingUser = await UserIdChecker(userId);
    while (existingUser.length > 0) {
      userId = generateUserId();
      existingUser = await UserIdChecker(userId);
    }

    const userName = "MIR" + userId;
    const password = "MIR" + userId;
    const email = userName + "@mirrorinstitue.com";

    const user = await strapi.entityService.create(
      "plugin::users-permissions.user",
      {
        data: {
          UserID: userId,
          name: bodyData.name,
          email: email,
          username: userName,
          password: password,
          role: process.env.STUDENT_ROLE_ID,
          batch: bodyData.batch,
          subjects: bodyData.subjects,
          gender: bodyData.gender,
          blocked: bodyData.blocked,
          canLogin: bodyData.canLogin,
        },
      }
    );

    if (user.error) {
      return ctx.badRequest(error);
    } else {
      const StudentDetails = await strapi.entityService.create(
        "api::student-detail.student-detail",
        {
          data: {
            UserID: userId,
            fatherName: bodyData.fatherName,
            motherName: bodyData.motherName,
            fatherMobile: bodyData.fatherMobile,
            motherMobile: bodyData.motherMobile,
            msgMobile: bodyData.msgMobile,
            joinDate: bodyData.joinDate,
            dob: bodyData.dob,
            school: bodyData.school,
          },
        }
      );
      if (StudentDetails.error) {
        return ctx.badRequest(error);
      }
      const endTime = new Date();
      const timeTaken = endTime - startTime;
      console.log(timeTaken);
      return ctx.send({ user, StudentDetails });
    }
  },

  async getStudentsForView(ctx) {
    const classNo = ctx.request.body.data.class;
    const batch = ctx.request.body.data.batch;
    let query = classNo;
    if (batch) {
      query = batch;
    }

    const studentUser = await strapi.entityService.findMany(
      "plugin::users-permissions.user",
      {
        filters: {
          batch: {
            batch: {
              $contains: [query],
            },
          },
        },
      }
    );
    // as soon as we get the students, we need to get the details of the students
    const students = await strapi.entityService.findMany(
      "api::student-detail.student-detail",
      {
        filters: {
          UserID: {
            $in: studentUser.map((user) => user.UserID),
          },
        },
      }
    );

    // now we need to merge the students and students details
    let studentsWithDetails = [];
    for (let key in students) {
      studentsWithDetails.push({
        ...students[key],
        ...studentUser.find((user) => user.UserID === students[key].UserID),
      });
    }
    return ctx.send(studentsWithDetails);
    // return ctx.send({ studentUser, students });

    // return ctx.send("Hello");
  },
};
