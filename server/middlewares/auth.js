const jwt = require("jsonwebtoken")
require("dotenv").config();
const User = require("../models/User");


// auth
exports.auth = async (req, res, next) => {
    try {
        // extract token
        // 3 ways
        const token = req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer ", "");

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
            req.user = decode;
        } catch (error) {
            // verification issue
            return res.status(401).json({
                success: false,
                message: "Token is invalid"
            })
        }

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
        if (req.user.acccountType !== "Student") {
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
        if (req.user.acccountType !== "Instructor") {
            return res.status(401).json({
                success: false,
                message: "This is a protected route for Instructor"
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

// isAdmin
exports.isAdmin = async (req, res, next) => {
    try {
        if (req.user.acccountType !== "Admin") {
            return res.status(401).json({
                success: false,
                message: "This is a protected route for Admin"
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