module.exports = {
  routes: [
    {
      method: "POST",
      path: "/auth/login",
      handler: "custom.login",
    },
    {
      method: "POST",
      path: "/attendance/students",
      handler: "custom.GetStudents",
    },
    {
      method: "GET",
      path: "/attendance/check",
      handler: "custom.checkAttendance",
    },
    {
      method: "GET",
      path: "/attendance/me",
      handler: "custom.getStudentAttendance",
    },
  ],
};
