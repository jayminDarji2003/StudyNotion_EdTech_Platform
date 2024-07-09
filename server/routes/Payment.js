// Import the required modules
const express = require("express")
const router = express.Router()

const { capturePayment, verifyPayment, sendPaymentSuccessEmail } = require("../controllers/Payments")

const { auth, isInstructor, isStudent, isAdmin } = require("../middlewares/auth")

// capture payment route
router.post("/capturePayment", auth, isStudent, capturePayment)

// verify payment route
router.post("/verifyPayment", auth, isStudent, verifyPayment)

// send payment success email
router.post("/sendPaymentSuccessEmail", auth, isStudent, sendPaymentSuccessEmail);

module.exports = router