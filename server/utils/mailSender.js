const nodemailer = require("nodemailer");
require("dotenv").config();

const mailSender = async (email, title, body) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
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