"use strict";

/**
 * send-sms service.
 */
const { post } = require("axios");

module.exports = () => ({
  async send(...args) {
    var [phoneNumber, type, data] = args;
    // check what type of message is to be sent and set messageTypeId accordingly
    let messageTypeId = "";
    if (type === "t-att") {
      messageTypeId = "144556";
    }
    data.push(""); // so that on join with '|' it also shows at the end
    let response = await post(
      process.env.FAST2SMS_API_URL,
      {
        route: "dlt",
        sender_id: "MirIns",
        message: messageTypeId,
        variables_values: data.join("|"),
        flash: 0,
        numbers: phoneNumber,
      },
      {
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(response.data);
    return response;
  },
});
