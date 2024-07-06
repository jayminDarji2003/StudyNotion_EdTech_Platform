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
        // Hmac takes two arguments : Algorithm and secretKey
        const shahsum = crypto.createHmac("shah256", webhookSecret)
        shahsum.update(JSON.stringify(req.body));  // converting to string
        const digest = shahsum.digest("hex");

        // match signature and digest
        if (signature === digest) {
            console.log("Payment is Authorized");

            // fetch courseId and userId - it added in the notes
            const { courseId, userId } = req.body.payload.payment.entity.notes;

            try {
                // perform the action
                // find the course and enroll the student
                const enrolledCourse = await Course.findOneAndUpdate(
                    { _id: courseId },
                    { $push: { enrolledStudents: userId } },
                    { new: true }
                )

                if (!enrolledCourse) {
                    return res.status(500).json({
                        success: false,
                        message: "Course not found"
                    })
                }

                console.log(enrolledCourse)

                // find the student and update the course
                const enrolledStudent = await User.findOneAndUpdate(
                    { _id: userId },
                    { $push: { courses: courseId } },
                    { new: true }
                )

                if (!enrolledStudent) {
                    return res.status(500).json({
                        success: false,
                        message: "student not found"
                    })
                }

                console.log(enrolledStudent)


                // successfully registered to course mail send
                const emailResponse = await mailSender(
                    enrolledStudent.email,
                    "Congratulations from CODEHELP",
                    "Congratulations! You have successfully registered to the course",

                )

                console.log(emailResponse);

                // return response
                return res.status(200).json({
                    success: true,
                    message: "Signature verification and enrolled student to course successfully"
                })

            } catch (error) {
                console.log("ERROR OCCURED WHILE VERIFIYING THE SIGNATURE");
                console.log(error)
                return res.status(500).json({
                    success: false,
                    message: "Error occured while verifying the signature"
                })
            }

        } else {
            return res.status(400).json({
                success: false,
                message: "signature did not match"
            })
        }

    } catch (error) {
        console.log("ERROR OCCURED WHILE VERIFIYING THE SIGNATURE");
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Error occured while verifying the signature"
        })
    }
}