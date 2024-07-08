const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
require("dotenv").config();
const mailSender = require("../utils/mailSender")
const { passwordUpdated } = require("../mail/templates/passwordUpdate")
const Profile = require("../models/Profile");
// const mailSender = require("../utils/mailSender");
const otpTemplate = require("../mail/templates/emailVerificationTemplate");

// sendOTP controller
exports.sendOTP = async (req, res) => {
    try {
        // fetch the email from req.body
        const { email } = req.body;


        // check if user is already exist
        const checkUserPresent = await User.findOne({ email });

        // if user alredy exists, then return response.
        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: "USER IS ALREADY REGISTERED"
            })
        }

        // generate otp
        let otp = otpGenerator.generate(6, {   // 6 is the length of OTP
            upperCaseAlphabets: false,  // not add uppercase alphabets
            lowerCaseAlphabets: false,  // not add lowercase alphabets
            specialChars: false   // not add special chars
        });

        // make sure otp must be unique
        let result = await OTP.findOne({ otp: otp });

        while (result) {
            otp = otpGenerator.generate(6, {   // 6 is the length of OTP
                upperCaseAlphabets: false,  // not add uppercase alphabets
                lowerCaseAlphabets: false,  // not add lowercase alphabets
                specialChars: false   // not add special chars
            });
            result = await OTP.findOne({ otp: otp });
        }


        // send otp to email
        const mailResponse = await mailSender(email, "Verification code : StudyNotion", otpTemplate(otp));

        // create OTP object
        const otpPayload = { email, otp };

        // create entry in database OTP.
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody)

        // return response
        res.status(200).json({
            success: true,
            message: "OTP SEND SUCCESSFULLY",
            otp,
        })

    } catch (error) {
        console.log("ERROR OCCURED WHILE SENDING OTP")
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
};



// signup controller
exports.signup = async (req, res) => {
    try {
        // data fetch from req.body
        const {
            firstName,
            lastName,
            email,
            contactNumber,
            password,
            confirmPassword,
            accountType,
            otp
        } = req.body;

        // validate the fetched data
        if (!firstName || !lastName || !email || !contactNumber || !password || !otp || !confirmPassword) {
            return res.status(403).json({
                success: false,
                message: "ALL FIELD MUST BE REQUIRED, PLEASE FILL ALL THE FIELDS WHICH SIGNUP"
            })
        }

        // 2 password match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "PASSWORD AND CONFIRM PASSWORD DOES NOT SAME, PLEASE TRY AGAIN"
            });
        }

        // check user already registered or not
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "USER ALREADY REGISTERED, PLEASE LOG IN WITH EMAIL AND PASSWORD"
            })
        }

        // find most recent OTP stored in the database
        const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        console.log("RECENT OTP =>", recentOtp)

        // validate OTP
        if (recentOtp.length === 0) {
            // did not get any otp
            return res.status(400).json({
                success: false,
                message: "OTP IS NOT MATCH"
            })
        } else if (otp !== recentOtp[0].otp) {
            // invalid otp
            return res.status(400).json({
                success: false,
                message: "OTP NOT MATCHING"
            })
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        let approved = ""
        approved === "Instructor" ? (approved = false) : (approved = true)


        // entry create in PROFILE database
        const profileDetails = await Profile.create({
            gender: null,
            dateOrBirth: null,
            about: null,
        })

        // entry create in USER database
        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: hashedPassword,
            accountType,
            approved,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`  // this api will create an default profile image based on first name and last name
        })

        // return response
        return res.status(200).json({
            success: true,
            message: "USER REGISTERD SUCCESSFULLY",
            user
        })
    } catch (error) {
        console.log("ERROR OCCURED WHILE REGISTERING USER");
        console.log(error)
        return res.status(200).json({
            success: false,
            message: "USER CAN NOT BE REGISTERED, PLEASE TRY AGAIN.",
        })
    }

}


// login
exports.login = async (req, res) => {
    try {
        // get email and password from req.body
        const { email, password } = req.body;

        // validate email and password
        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: "All fields are required, please try again"
            })
        }

        // user check exists or not
        const user = await User.findOne({ email }).populate("additionalDetails");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "user is not registered, please sign up first"
            })
        }

        // match password
        // bcrypt.compare  -> match password
        // generate JWT token
        // generate cookie
        if (await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType
            }

            const token = jwt.sign(
                payload,
                process.env.JWT_SECRET,
                {
                    expiresIn: "24h"
                })

            user.token = token;
            user.password = undefined;

            // generate cookie
            const options = {
                expiresIn: new Date(Date.now() + 3 * 34 * 60 * 60 * 1000), // 3 days,
                httpOnly: true,
            }

            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: "USER LOGGED IN SUCCESSFULLY"
            })
        } else {
            return res.status(401).json({
                success: false,
                message: "PASSWORD IS INCORRECT"
            })
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "LOGIN FAILURE, PLEASE TRY AGAIN"
        })
    }
}

// reset password
exports.changePassword = async (req, res) => {
    try {
        // get data from req.body
        const userDetails = await User.findById(req.user.id);

        //get oldPassword,newPassword,onfirmNewPassword
        const { oldPassword, newPassword } = req.body;

        // validate old password
        const isPasswordMatch = await bcrypt.compare(oldPassword, userDetails.password)

        if (!isPasswordMatch) {
            // If old password does not match, return a 401 (Unauthorized) error
            return res.status(401)
                .json({
                    success: false,
                    message: "The password is incorrect"
                })
        }

        // update new password in Database
        const encryptedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUserDetails = await User.findByIdAndUpdate(
            req.user.id,
            { password: encryptedPassword },
            { new: true }
        )

        // send email - password updated
        // Send notification email
        try {
            const emailResponse = await mailSender(
                updatedUserDetails.email,
                "Password for your account has been updated",
                passwordUpdated(
                    updatedUserDetails.email,
                    `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
                )
            )
            console.log("Email sent successfully:", emailResponse.response)
        } catch (error) {
            // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
            console.error("Error occurred while sending email:", error)
            return res.status(500).json({
                success: false,
                message: "Error occurred while sending email",
                error: error.message,
            })
        }


        // return response
        return res.status(200).json({
            success: true,
            message: "Password updated successfully"
        })
    } catch (error) {
        // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
        console.error("Error occurred while updating password:", error)
        return res.status(500).json({
            success: false,
            message: "Error occurred while updating password",
            error: error.message,
        })
    }
}