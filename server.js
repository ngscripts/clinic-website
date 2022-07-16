const { validate, ValidationError, Joi } = require('express-validation')
const { sendSMS } = require("./services/sms.service");
const { sendEmail} = require("./services/email.service");
const { ENV } = require("./services/env.service");
const express = require('express');
const app = express();

const bookAppointmentValidation = {
    body: Joi.object({
        name: Joi.string()
            .min(3).max(25)
            .required(),
        mobile: Joi.string()
            .regex(/^((\+92)|(0092))-{0,1}\d{3}-{0,1}\d{7}$|^\d{11}$|^\d{4}-\d{7}$/)
            .required(),
        email: Joi.string()
            .email()
            .required(),
        appointmentTime: Joi.number()
            .greater((new Date()).getTime())
            .required(),
    }),
};

app.use(express.static('app'));
app.use(express.json());
app.post('/api/book-appointment',
    validate(bookAppointmentValidation, {}, {}),
    async (req, res) => {
    const body = req.body;
    const emailSubject = `New appointment from ${ body.name }`;
    const emailBody = `
    Dear Dr.Zoha Wisal,
    
    You have received an appointment scheduled by Mr./ Ms. ${ body.name }
    
    
    Appointment Date and Time: ${ new Date(body.appointmentTime).toString() }
    
    
    Phone Number: ${ body.mobile }
    Email: ${ body.email }
    `;

    try {
        await sendSMS(ENV.APPOINTMENT_RECIPIENT_PHONE, emailBody);
        await sendEmail(ENV.APPOINTMENT_RECIPIENT_EMAIL, emailSubject, emailBody);
    } catch (e) {
        res.status(400).send(
            {
                message: e.toString(),
            });
    }
    res.send({
        message: 'Request was successful.'
    });
});

app.use((err, req, res, next) => {
    if (err instanceof ValidationError) {
        return res.status(err.statusCode).json(err);
    }
    return res.status(500).json(err);
});

const server = app.listen(ENV.PORT, ENV.HOST, function () {
    const host = server.address().address;
    const port = server.address().port;
    console.log('App is listening at http://%s:%s', host, port);
});
