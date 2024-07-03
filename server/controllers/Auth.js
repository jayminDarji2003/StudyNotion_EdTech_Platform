const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");

// sendOTP
exports.sendOTP = async (req, res) => {
    try {
        // fetch the email from req.body
        const { email } = req.body;

        // check if user is already exist
        const checkUserPresent = await User.findOne({ email });

        // user exists
        if (checkUserPresent) {
            return res.status(401).json({
                success: true,
                message: "USER ALREADY EXIST"
            })
        }

        // generate otp
        let otp = otpGenerator.generate(6, {   // 6 is the length of OTP
            upperCaseAlphabets: false,  // not add uppercase alphabets
            lowerCaseAlphabets: false,  // not add lowercase alphabets
            specialChars: false   // not add special chars
        });

        console.log("OTP GENERATED => ", otp);

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

        const otpPayload = { email, otp };

        // create entry in database
        const otpBody = await OTP.create(otpPayload);
        console.log("OTP BODY => ", otpBody);

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
            message: "ERROR OCCURED WHILE SENDING OTP"
        })
    }
};


// signup controller
exports.signup = async (req, res) => {
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

    // validate
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
            message: "PASSWORD AND CONFIRM PASSWORD DOES NOT MATCH, PLEASE TRY AGAIN"
        });
    }

    // check user already registered or not
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: "USER ALREADY REGISTERED, PLEASE LOG IN WITH PASSWORD"
        })
    }

    // find most recent OTP stored in the database
    const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    console.log("RECENT OTP =>", recentOtp)

    // validate OTP
    if (recentOtp.length === 0) {
        // not get otp
        return res.status(404).json({
            success: false,
            message: "OTP NOT FOUND IN DATABASE"
        })
    } else if (otp !== recentOtp) {
        // invalid otp
        return res.status(400).json({
            success: false,
            message: "OTP NOT MATCHING"
        })
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // entry create in database

    const profileDetails = await Profile.create({
        gender: null,
        dateOrBirth: null,
        about: null,
    })


    const user = await User.create({
        firstName,
        lastName,
        email,
        contactNumber,
        password: hashedPassword,
        confirmPassword: hashedPassword,
        accountType,
        additionalDetails: profileDetails._id,
        image: 
    })

    // return response
}


// login

// reset password