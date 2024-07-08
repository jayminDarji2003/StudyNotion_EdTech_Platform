// Import the required modules
const express = require("express")
const router = express.Router()

// Import the Controllers

// Course Controllers Import
const {
  createCourse,
  getAllCourses,
  getAllCourseDetails,
  getFullCourseDetails,
  editCourse,
  getInstructorCourses,
  deleteCourse,
} = require("../controllers/Course")


// Categories Controllers Import
const {
  showAllCategories,
  createCategory,
  categoryPageDetails,
} = require("../controllers/Category")

// Sections Controllers Import
const {
  createSection,
  updateSection,
  deleteSection,
} = require("../controllers/Section")

// Sub-Sections Controllers Import
const {
  createSubSection,
  updateSubSection,
  deleteSubSection,
} = require("../controllers/Subsection")

// Rating Controllers Import
const {
  createRatingAndReview,
  getAverageRating,
  getAllRatingAndReview,
} = require("../controllers/RatingAndReview")

const {
  updateCourseProgress
} = require("../controllers/courseProgress");

// Importing Middlewares
const { auth, isInstructor, isStudent, isAdmin } = require("../middlewares/auth")

// ! Course routes

//* Only Done By Intructors
// Courses can Only be Created by Instructors
router.post("/createCourse", auth, isInstructor, createCourse)

//Add a Section to a Course
router.post("/addSection", auth, isInstructor, createSection)

// Update a Section
router.post("/updateSection", auth, isInstructor, updateSection)

// Delete a Section
router.post("/deleteSection", auth, isInstructor, deleteSection)

// Edit Sub Section
router.post("/updateSubSection", auth, isInstructor, updateSubSection)

// Delete Sub Section
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection)

// Add a Sub Section to a Section
router.post("/addSubSection", auth, isInstructor, createSubSection)




// Get all Registered Courses
router.get("/getAllCourses", getAllCourses)

// Get Details for a Specific Courses
router.post("/getCourseDetails", getAllCourseDetails)

// Get Details for a Specific Courses
router.post("/getFullCourseDetails", auth, getFullCourseDetails)

// Edit Course 
router.post("/editCourse", auth, isInstructor, editCourse)

// Get all Courses Under a Specific Instructor
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses)

// Delete a Course
router.delete("/deleteCourse", deleteCourse)

// update course progress
router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress);

// ********************************************************************************************************
//                                      Category routes (Only by Admin)
// ********************************************************************************************************
// Category can Only be Created by Admin
// TODO: Put IsAdmin Middleware here

// create category
router.post("/createCategory", auth, isAdmin, createCategory)

// show categories
router.get("/showAllCategories", showAllCategories)

// get whole category page details
router.post("/getCategoryPageDetails", categoryPageDetails)

// ********************************************************************************************************
//                                      Rating and Review
// ********************************************************************************************************
// create rating and review
router.post("/createReview", auth, isStudent, createRatingAndReview)

// get average rating and review
router.get("/getAverageRating", getAverageRating)

// get all reviews and rating
router.get("/getReviews", getAllRatingAndReview)

module.exports = router