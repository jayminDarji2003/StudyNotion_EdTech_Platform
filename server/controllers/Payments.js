// PAYMENT CONTROLLERS
const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const { courseEnrollmentEmail } = require("../mail/templates/courseEnrollmentEmail");

// Capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {
    try {
        // get courseId and userId
        const { courseId } = req.body;  // get the course id
        const userId = req.user.id; // get the user id

        // validation
        if (!courseId) {
            return res.status(404).json({
                success: false,
                message: "Please provide valid course id",
            })
        }

        // check valid courseId
        let course;
        try {
            course = await Course.findById(courseId);
            if (!course) {
                return res.json({
                    success: false,
                    message: "Could not find the course"
                })
            }
            console.log("COURSE => ", course);

            // check user already pay for the same course

            // converting userId to objectId
            const uId = new mongoose.Types.ObjectId(userId);
            // check if user already present in course->enrolledStudents
            if (course.enrolledStudents.includes(uId)) {
                return res.status(200).json({
                    success: false,
                    message: "Student is already enrolled"
                })
            }

        } catch (error) {
            console.log("ERROR OCCURED WHILE FETCHING COURSE DETAILS");
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "something went wrong while fetching course details"
            })
        }

        // order create
        const amount = course.price;
        const currency = "INR";

        const options = {
            amount: amount * 100,  // we need to multipy with 100 to show link -> Rs 400.00
            currency: currency,
            receipt: Math.random(Date.now()).toString(),
            notes: {
                courseId: courseId,
                userId: userId
            }
        }

        try {
            // initiate the payment using razorpay
            const paymentResponse = await instance.orders.create(options);
            console.log("PAYMENT RESPONSE => ", paymentResponse);
            return res.status(200).json({
                success: true,
                courseName: course.courseName,
                courseDescription: course.courseDescription,
                thumbnail: course.thumbnail,
                orderId: paymentResponse.id,
                currency: paymentResponse.currency,
                amount: paymentResponse.amount,
            })
        } catch (error) {
            console.log("ERROR OCCURED WHILE INITIATE PAYMENT");
            return res.status(404).json({
                success: false,
                message: "Could not initiate order"
            })
        }

        // return response
    } catch (error) {
        console.log("ERROR OCCURED WHILE CAPTURE PAYMENT");
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error occured while capturing payment",
            error: error.message
        })
    }
}


// verify signature handler fnx
exports.verifySignature = async (req, res) => {
    try {
        // our local webhook secret
        const webhookSecret = "123456789";
        
        // fetching secret from razorpay webhook
        // it is in the "hashed formate"
        const signature = req.headers["x-rasorpay-signature"];

        // converting our local webhooksecret to hashed formate
        crypto.createHmac()

    } catch (error) {
        
    }
}