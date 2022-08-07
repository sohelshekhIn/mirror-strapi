"use strict";

/**
 * demo service.
 */
const { post } = require("axios");

module.exports = () => ({
  test(...args) {
    var phoneNumber,
      type,
      data = args;

    let response = { okay: true };

    return phoneNumber, type, data;
  },

  async send(...args) {
    var [phoneNumber, type, data] = args;
    console.log("Running");
    // check what type of message is to be sent and set messageTypeId accordingly
    let messageTypeId = "";
    if (type === "t-att") {
      messageTypeId = "144556";
    }
    data.push(""); // so that on join with '|' it also shows at the end
    console.log(phoneNumber, type, data);
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
          authorization:
            "ABNAsvplxBaZALlCdsJ10n2Q8YasvGHotfTAesHtnBf44Of6pZGne1OQHIW8",
          "Content-Type": "application/json",
        },
      }
    );

    console.log(response.data);
    return response;
  },
});
