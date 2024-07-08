const express = require("express")
const router = express.Router()

const {
  auth,
  isInstructor
} = require("../middlewares/auth")

const {
  deleteAccount,
  updateProfile,
  getAllUserDetails,
  updateDisplayPicture,
  getEnrolledCourses,
  instructorDashboard,
} = require("../controllers/Profile")

// ********************************************************************************************************
//                                      Profile routes
// ********************************************************************************************************
// Delete User Account
router.delete("/deleteProfile", auth, deleteAccount)

// update user profile
router.put("/updateProfile", auth, updateProfile)

// get user details
router.get("/getUserDetails/:id", auth, getAllUserDetails)

// Get Enrolled Courses
router.get("/getEnrolledCourses", auth, getEnrolledCourses)

// update display picture
router.put("/updateDisplayPicture", auth, updateDisplayPicture)

// instructor dashboard
router.get("/instructorDashboard", auth, isInstructor, instructorDashboard)

module.exports = router