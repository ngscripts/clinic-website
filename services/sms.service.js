const axios = require('axios');
const { ENV } = require("./env.service");

const sendSMS = async (receiverMobile, message) => {
    const APIKey = ENV.VEEVO_API_KEY;
    const receiver = receiverMobile;
    const sender = ENV.VEEVO_SENDER;
    const url = "http://api.veevotech.com/sendsms?hash=" + APIKey + "&receivenum=" + receiver + "&sendernum=" + encodeURIComponent(sender)+"&textmessage=" + encodeURIComponent(message);

    const resp = await axios.get(url);
    console.log('SMS Resp: ', resp);
    return resp;
};

module.exports = {
    sendSMS,
}