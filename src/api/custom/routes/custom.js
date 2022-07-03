module.exports = {
  routes: [
    {
      method: "POST",
      path: "/auth/login",
      handler: "custom.login",
    },

    // /info/ path to get info in public/login domain
    {
      method: "GET",
      path: "/info/attendance/students",
      handler: "custom.GetStudents",
    },
    {
      method: "GET",
      path: "/info/attendance/check",
      handler: "custom.checkAttendance",
    },
    {
      method: "GET",
      path: "/info/attendance/me",
      handler: "custom.getStudentAttendance",
    },
    {
      method: "GET",
      path: "/info/students/view-one",
      handler: "custom.getStudentForViewOne",
    },
    {
      method: "POST",
      path: "/info/tests",
      handler: "custom.getTests",
    },
    {
      method: "POST",
      path: "/info/submissions",
      handler: "custom.getSubmissions",
    },

    {
      method: "POST",
      path: "/data/students/register",
      handler: "custom.registerStudent",
    },
    {
      method: "POST",
      path: "/data/students/update",
      handler: "custom.updateStudent",
    },
    {
      method: "POST",
      path: "/data/students/view",
      handler: "custom.getStudentsForView",
    },
  ],
};
