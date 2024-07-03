const User = require("../models/User");
const mailSender = require("../utils/mailSender");

// reset password token
exports.resetPasswordToken = async (req, res) => {
    try {
        // get email fro req.body 
        const {email} = req.body;

        // check user for this email, email validation
        const user = await User.findOne({email:email});

        if(!user){
            return res.status(401).json({
                success: false,
                message: "Your email is not registerd."
            })
        }

        // generate token
        // update user, by adding token and exiration time
        // create url
        // send mail with url
        // return response



        const url = `http://localhost:3000/reset-password/${token}`

    } catch (error) {

    }
}

// reset password