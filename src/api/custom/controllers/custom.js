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

    try {
      let { data } = await axios.post(`${absoluteURL}/api/auth/local`, body);
      // get role using first two letters of UserId
      const role =
        data.user.UserID.substring(0, 2) == "ST" ? "student" : "faculty";
      let query = {
        populate: {
          role: {
            fields: ["type"],
          },
        },
        fields: ["username", "name", "blocked", "UserID", "gender", "canLogin"],
      };
      if (role === "student") {
        query.populate.batch = {
          fields: ["batch"],
        };
        query.fields.push("subjects");
      } else {
        query.fields.push("facultyData");
      }

      const populatedUser = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        data.user.id,
        query
      );
      data.user = populatedUser;
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
      if (
        error.response.status === 400 &&
        error.response.data.error.name === "ApplicationError"
      ) {
        return ctx.badRequest(null, {
          messages: {
            id: "account_blocked",
            message: "Account Blocked, contact Administrator",
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
          provider: "local",
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
      return ctx.send({ user, StudentDetails });
    }
  },

  // update students data in Users Table and Student Details Table
  async updateStudent(ctx) {
    const bodyData = ctx.request.body.data;
    const userId = bodyData.reffId.split("_")[0];
    const detailsId = bodyData.reffId.split("_")[1];
    const studentUser = await strapi.entityService.update(
      "plugin::users-permissions.user",
      userId,
      {
        data: {
          name: bodyData.name,
          role: process.env.STUDENT_ROLE_ID,
          batch: bodyData.batch,
          subjects: bodyData.subjects,
          gender: bodyData.gender,
          blocked: bodyData.blocked,
          canLogin: bodyData.canLogin,
        },
      }
    );

    // handle studentUser errors
    if (studentUser.error) {
      return ctx.badRequest(error);
    } else {
      const studentDetails = await strapi.entityService.update(
        "api::student-detail.student-detail",
        detailsId,
        {
          data: {
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
      if (studentDetails.error) {
        return ctx.badRequest(error);
      }
      // add ReffId to student user
      studentUser.reffId = `${studentUser.id}_${studentDetails.id}`;
      // delete studentUser.id
      delete studentUser.id;
      delete studentDetails.id;
      return ctx.send({
        ...studentUser,
        ...studentDetails,
      });
    }
  },
  async getStudentsForView(ctx) {
    const classNo = ctx.request.body.data.class;
    const batch = ctx.request.body.data.batch;
    const subjects = ctx.request.body.data.subjects;
    let batchContins = classNo;
    if (batch && batch !== "DEFAULT") {
      batchContins = batch;
    }

    let query = {
      filters: {
        batch: {
          batch: {
            $contains: [batchContins],
          },
        },
      },
      populate: {
        batch: {
          fields: ["batch"],
        },
      },
      fields: [
        "UserID",
        "name",
        "username",
        "gender",
        "canLogin",
        "blocked",
        "subjects",
      ],
    };

    const studentUser = await strapi.entityService.findMany(
      "plugin::users-permissions.user",
      query
    );

    // filter students based on subjects and if even one subject is not present in student's subjects, then remove the student
    let students = [];
    for (let key in studentUser) {
      if (subjects && subjects.length > 0) {
        let found = false;
        let contracdictSubjectFound = false;
        for (let i = 0; i < studentUser[key].subjects.length; i++) {
          for (let j = 0; j < subjects.length; j++) {
            if (!contracdictSubjectFound) {
              if (studentUser[key].subjects.includes(subjects[j])) {
                found = true;
              } else {
                contracdictSubjectFound = true;
              }
            }
          }
        }
        if (found && !contracdictSubjectFound) {
          students.push(studentUser[key]);
        }
      } else {
        students = studentUser;
      }
    }

    // as soon as we get the students, we need to get the details of the students
    const studentDetails = await strapi.entityService.findMany(
      "api::student-detail.student-detail",
      {
        filters: {
          UserID: {
            $in: students.map((user) => user.UserID),
          },
        },
        fields: [
          "UserID",
          "fatherName",
          "motherName",
          "fatherMobile",
          "motherMobile",
          "msgMobile",
          "joinDate",
          "dob",
          "school",
        ],
      }
    );
    // handle errors
    if (studentUser.error) {
      return ctx.badRequest(studentUser.error);
    }
    if (studentDetails.error) {
      return ctx.badRequest(studentDetails.error);
    }

    // now we need to merge the students and students details
    let studentsWithDetails = [];
    for (let key in studentDetails) {
      studentsWithDetails.push({
        ...studentDetails[key],
        ...students.find((user) => user.UserID === studentDetails[key].UserID),
      });
    }
    return ctx.send(studentsWithDetails);
  },

  async getStudentForViewOne(ctx) {
    // get userid from params
    const userId = ctx.request.query.id;
    // get user details
    const studentUser = await strapi.entityService.findMany(
      "plugin::users-permissions.user",
      {
        filters: {
          UserID: userId,
        },
        populate: {
          batch: {
            fields: ["batch"],
          },
        },
        fields: [
          "UserID",
          "name",
          "username",
          "gender",
          "canLogin",
          "blocked",
          "subjects",
        ],
      }
    );

    // handle errors
    if (studentUser.error) {
      return ctx.badRequest(studentUser.error);
    }

    // get student details
    const studentDetails = await strapi.entityService.findMany(
      "api::student-detail.student-detail",
      {
        filters: {
          UserID: userId,
        },
        fields: [
          "UserID",
          "fatherName",
          "motherName",
          "fatherMobile",
          "motherMobile",
          "msgMobile",
          "joinDate",
          "dob",
          "school",
        ],
      }
    );

    if (studentDetails.error) {
      return ctx.badRequest(studentDetails.error);
    }

    // add ReffId to student user
    studentUser[0].reffId = `${studentUser[0].id}_${studentDetails[0].id}`;
    // delete studentUser.id
    delete studentUser[0].id;
    delete studentDetails[0].id;
    return ctx.send({ ...studentUser["0"], ...studentDetails["0"] });
  },

  async getTests(ctx) {
    let userId = ctx.request.body.data.id;
    // get marks
    const marks = await strapi.entityService.findMany("api::mark.mark", {
      limit: 10,
    });

    // handle errors
    if (marks.error) {
      return ctx.badRequest(marks.error);
    }

    // for every marks, get the test which is associated with FC0001
    let tests = [];
    for (let key in marks) {
      if (marks[key].data.addedBy[0] === userId || userId === "*") {
        tests.push(marks[key]);
      }
    }
    return ctx.send(tests);
  },
};
