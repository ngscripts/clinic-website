const { ENV } = require("./env.service");
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(ENV.SENDGRID_API_KEY);

const sendEmail = async (to, subject, text) => {
    const msg = {
        to,
        from: ENV.SENDGRID_SENDER_EMAIL,
        subject,
        text,
        // html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    };
    const resp = await sgMail.send(msg);
    console.log('Email Resp: ', resp);
    return resp;
};

module.exports = {
    sendEmail,
};
