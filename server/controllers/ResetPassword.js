const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");

// reset password token handler
// this handler is used to send link in mail
// store token in database
exports.resetPasswordToken = async (req, res) => {
    try {
        // get email fro req.body 
        const { email } = req.body;

        // check user for this email, email validation
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(401).json({   // 401 (unauthorized error) 
                success: false,
                message: "Your email is not registerd."
            })
        }

        // generate token
        const token = crypto.randomUUID();  // generate random token

        // update user, by adding token and exiration time
        const updateDetails = await User.findOneAndUpdate(
            { email: email },
            {
                token: token,
                resetPasswordExpires: Date.now() + 5 * 60 * 1000, // (60 * 1000) = 1 min  and whole will be 5 minutes
            },
            { new: true }   // to get new document in response
        )

        console.log("UPDATED DOCUMENTS => ", updateDetails)

        // create url
        const url = `http://localhost:3000/reset-password/${token}`

        // send mail with url
        // 3 parameters : email, subject, body
        await mailSender(email,
            "Password reset link",
            `Your Link for email verification is ${url}. Please click this url to reset your password.`
        )

        // return response
        return res.status(200).json({
            success: true,
            message: "Email sent successfully, please check email and reset password"
        })
    } catch (error) {
        console.log("ERROR OCCURED WHILE RESETING PASSWORD");
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Error occured while resetting password"
        })
    }
}

// reset password handler
// here we are actually resetting the password
exports.resetPassword = async (req, res) => {
    try {
        // data fetch
        const { newPassword, confirmNewPassword, token } = res.body;
        // note : we can fetch "token" from params also

        // validation
        if (!newPassword || !confirmNewPassword || !token) {
            return res.status(401).json({
                success: false,
                message: "All fields are required, please fill all the fields"
            })
        }
        else if (newPassword !== confirmNewPassword) {
            return res.status(401).json({
                success: false,
                message: "password and confirm password not matching"
            })
        }

        // get user details from database using token
        const userDetails = await User.findOne({ token: token });

        // if no entry - invalid token
        if (!userDetails) {
            return res.status(401).json({
                success: false,
                message: "Token is invalid"
            })
        }

        // token time check
        if (userDetails.resetPasswordExpires < Date.now()) {
            // token expired
            return res.json({
                success: false,
                message: "Token is expired, please regenerate the token"
            });

        }

        // hash password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // update the password
        const updatedUser = await User.findOneAndUpdate(
            { token: token },
            { password: hashedPassword },
            { new: true })


        // return response
        return res.status(200).json({
            success: true,
            message: "Password updated successfully"
        })
    } catch (error) {
        console.log("AN ERROR OCCURED WHILE RESETING PASSWORD");
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "something went wrong while password reseting"
        })
    }
}
