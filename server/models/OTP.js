const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate")

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 10 * 60  // 5 minutes
    }
}, { timestamps: true });


// send OTP to email
async function sendVerificationEmail(email, otp) {
    try {
        const mailResponse = await mailSender(
            email,  // email address 
            "Verification Email from StudyNotion",  // subject of email
            emailTemplate(otp))   // body of email

        console.log("MAIL SEND SUCCESSFULLY");
        console.log(mailResponse);
    } catch (error) {
        console.error(error);
        console.log("ERROR OCCURED WHILE SENDING VERIFICATION EMAIL")
    }
}


// pre middlware to send otp before entry in database
OTPSchema.pre("save", async function (next) {
    await sendVerificationEmail(this.email, this.otp);
    next();
})



module.exports = mongoose.model("OTP", OTPSchema);
