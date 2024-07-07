const nodemailer = require("nodemailer");
require("dotenv").config();

const mailSender = async (email, title, body) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMPT_HOST,
            port: process.env.SMPT_PORT,
            service: process.env.SMPT_SERVICE,
            auth: {
                user: process.env.SMPT_MAIL,
                pass: process.env.SMPT_PASSWORD,
            },
        });

        const info = await transporter.sendMail({
            from: "StudyNotion || Jaymin Darji", // sender address
            to: `${email}`, // receiver
            subject: `${title}`, // Subject line
            html: `${body}`, // html body
        });

        console.log("INFO => ", info);
        return info;

    } catch (error) {
        console.error(error);
        console.log("ERROR OCCURED WHILE SENDING MAIL")
    }
}

module.exports = mailSender;