const jwt = require("jsonwebtoken")
require("dotenv").config();
const User = require("../models/User");


// auth
// This function is used as middleware to authenticate user requests
exports.auth = async (req, res, next) => {
    try {
        // extract token
        // 3 ways
        const token =
            req.cookies.token ||
            req.body.token ||
            req.header("Authorization").replace("Bearer ", "");

        // token missing, then return response
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token is missing"
            })
        }

        // verify token
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            console.log("DECODED TOKEN => ", decode)

            // Storing the decoded JWT payload in the request object for further use
            req.user = decode;
        } catch (error) {
            // verification issue
            // If JWT verification fails, return 401 Unauthorized response
            return res.status(401).json({
                success: false,
                message: "Token is invalid"
            })
        }

        // If JWT is valid, move on to the next middleware or request handler
        next(); // go to next middleware

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while validating token"
        })
    }
}

// isStudent
exports.isStudent = async (req, res, next) => {
    try {
        const userDetails = await User.findOne({ email: req.user.email });


        if (userDetails.acccountType !== "Student") {
            return res.status(401).json({
                success: false,
                message: "This is a protected route for Students"
            })
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "User role cannot be verified, please try again"
        })
    }
}

// isInstructor
exports.isInstructor = async (req, res, next) => {
    try {
        const userDetails = await User.findOne({ email: req.user.email });

        if (userDetails.accountType !== "Admin") {
            return res.status(401).json({
                success: false,
                message: "This is a Protected Route for Admin",
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "User role cannot be verified, please try again"
        })
    }
}

// isAdmin
exports.isAdmin = async (req, res, next) => {
    try {
        const userDetails = await User.findOne({ email: req.user.email });
        // console.log(userDetails);

        // console.log(userDetails.accountType);

        if (userDetails.accountType !== "Instructor") {
            return res.status(401).json({
                success: false,
                message: "This is a Protected Route for Instructor",
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "User role cannot be verified, please try again"
        })
    }
}