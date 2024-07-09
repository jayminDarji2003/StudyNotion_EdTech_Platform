// COURSE CONTROLLERS

const Course = require("../models/Course")
const Category = require("../models/Category")
const User = require("../models/User");
const { uploadToCloudinary } = require("../utils/imageUploader");
const Section = require("../models/Section")
const SubSection = require("../models/SubSection")
const CourseProgress = require("../models/CourseProgress")
const { convertSecondsToDuration } = require("../utils/secToDuration")

// create course handler 
exports.createCourse = async (req, res) => {
    try {
        // fetch data from req.body
        let {
            courseName,
            courseDescription,
            whatYouWillLearn,
            price,
            categoryId,
            tag: _tag,
            status,
            instructions: _instructions,
        } = req.body;

        // fetch file(thumbnail) from req.file
        const thumbnail = req.files.thumbnailImage;

        // Convert the tag and instructions from stringified Array to Array
        const tag = JSON.parse(_tag)
        const instructions = JSON.parse(_instructions)

        // console.log("tag", tag)
        // console.log("instructions", instructions)

        // validation
        if (
            !courseName ||
            !courseDescription ||
            !whatYouWillLearn ||
            !price ||
            !tag.length ||
            !categoryId ||
            !instructions.length ||
            !thumbnail
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields must be required."
            })
        }

        // status details
        if (!status || status === undefined) {
            status = "Draft"
        }


        // instructor details
        const userId = req.user.id;

        const instructorDetails = await User.findById(userId,
            { accountType: "Instructor" }
        );
        // console.log("INSTRUCTOR DETAILS => ", instructorDetails)

        if (!instructorDetails) {
            return res.status(404).json({
                success: false,
                message: "Instructor details not found."
            })
        }

        // check category valid or not
        // this category come from dropdown so it will be valid 100%
        const categoryDetails = await Category.findById(categoryId);
        if (!categoryDetails) {
            return res.status(404).json({
                success: false,
                message: "category details not found."
            })
        }

        // upload image to cloudinary
        const thumbnailImage = await uploadToCloudinary(
            thumbnail,
            process.env.FOLDER_NAME
        );

        // start entry in database
        // entry in course db
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            whatYouWillLearn,
            price,
            tag,
            instructor: instructorDetails._id,
            thumbnail: thumbnailImage.secure_url,
            category: categoryDetails._id,
            status,
            instructions,
        })
        // console.log("NEW COURSE CREATED SUCCESSFULLY => ", newCourse)

        // entry in user db
        // add new course to user schema
        const userResponse = User.findByIdAndUpdate(
            { _id: instructorDetails._id },
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            { new: true }
        )

        // console.log("INSTRUCTOR UPDATED SUCCESSFULLY => ", userResponse)

        // entry in category db
        const categoryResponse = Category.findByIdAndUpdate(
            { _id: categoryDetails._id },
            {
                $push: {
                    course: newCourse._id,
                }
            },
            { new: true }
        )

        // console.log("CATEGORY UPDATED SUCCESSFULLY => ", categoryResponse)

        // return response
        return res.status(200).json({
            success: true,
            message: "Course created successfully",
            data: newCourse
        })

    } catch (error) {
        console.log("ERROR OCCURED WHILE CREATING COURSE");
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while creating course"
        })
    }
}


// Edit Course Details
exports.editCourse = async (req, res) => {
    try {
        const { courseId } = req.body
        const updates = req.body
        const course = await Course.findById(courseId)

        if (!course) {
            return res.status(404).json({ error: "Course not found" })
        }

        // If Thumbnail Image is found, update it
        if (req.files) {
            console.log("thumbnail update")
            const thumbnail = req.files.thumbnailImage
            const thumbnailImage = await uploadImageToCloudinary(
                thumbnail,
                process.env.FOLDER_NAME
            )
            course.thumbnail = thumbnailImage.secure_url
        }

        // Update only the fields that are present in the request body
        for (const key in updates) {
            if (updates.hasOwnProperty(key)) {
                if (key === "tag" || key === "instructions") {
                    course[key] = JSON.parse(updates[key])
                } else {
                    course[key] = updates[key]
                }
            }
        }

        await course.save()

        const updatedCourse = await Course.findOne({
            _id: courseId,
        })
            .populate({
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                },
            })
            .populate("category")
            .populate("ratingAndReviews")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec()

        res.json({
            success: true,
            message: "Course updated successfully",
            data: updatedCourse,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        })
    }
}


// Delete the Course
exports.deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.body

        // Find the course
        const course = await Course.findById(courseId)
        if (!course) {
            return res.status(404).json({ message: "Course not found" })
        }

        // Unenroll students from the course
        const studentsEnrolled = course.enrolledStudents
        for (const studentId of studentsEnrolled) {
            await User.findByIdAndUpdate(studentId, {
                $pull: { courses: courseId },
            })
        }

        // Delete sections and sub-sections
        const courseSections = course.courseContent
        for (const sectionId of courseSections) {
            // Delete sub-sections of the section
            const section = await Section.findById(sectionId)
            if (section) {
                const subSections = section.subSection
                for (const subSectionId of subSections) {
                    await SubSection.findByIdAndDelete(subSectionId)
                }
            }

            // Delete the section
            await Section.findByIdAndDelete(sectionId)
        }

        // Delete the course
        await Course.findByIdAndDelete(courseId)

        return res.status(200).json({
            success: true,
            message: "Course deleted successfully",
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}


// get all courses handler
exports.getAllCourses = async (req, res) => {
    try {
        // get all courses
        const courses = await Course.find(
            { status: "Published" })
            .populate("instructor")
            .exec()

        console.log("ALL COURSES => ", courses);

        // return response
        return res.status(200).json({
            success: true,
            message: "All course found successfully",
            data: courses
        })
    } catch (error) {
        console.log("ERROR OCCURED WHILE GETTING ALL COURSES");
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching courses"
        })
    }
}



// get all course details
exports.getAllCourseDetails = async (req, res) => {
    try {
        // get course id
        const { courseId } = req.body;

        // find course details
        const courseDetails = await Course.find(
            {
                _id: courseId,
                status: "Published"
            })
            .populate({
                path: "instructor",
                populate: {
                    path: "additionalDetails"
                }
            })
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                }
            })
            .populate("ratingAndReview")
            .populate("category")
            .populate("enrolledStudents")
            .exec();


        // validation
        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: "could not find course with whole details"
            })
        }

        // return response
        return res.status(200).json({
            success: true,
            message: "Course details fetched successfully",
            data: courseDetails
        })


    } catch (error) {
        console.log("ERROR OCCURED WHILE GETTING COURSE DETAILS");
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching courses details"
        })
    }
}


exports.getFullCourseDetails = async (req, res) => {
    try {
        const { courseId } = req.body
        const userId = req.user.id
        const courseDetails = await Course.findOne({
            _id: courseId,
        })
            .populate({
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                },
            })
            .populate("category")
            // .populate("ratingAndReviews")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec()

        let courseProgressCount = await CourseProgress.findOne({
            courseID: courseId,
            userId: userId,
        })

        console.log("courseProgressCount : ", courseProgressCount)

        if (!courseDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find course with id: ${courseId}`,
            })
        }

        // if (courseDetails.status === "Draft") {
        //   return res.status(403).json({
        //     success: false,
        //     message: `Accessing a draft course is forbidden`,
        //   });
        // }

        let totalDurationInSeconds = 0
        courseDetails.courseContent.forEach((content) => {
            content.subSection.forEach((subSection) => {
                const timeDurationInSeconds = parseInt(subSection.timeDuration)
                totalDurationInSeconds += timeDurationInSeconds
            })
        })

        const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

        return res.status(200).json({
            success: true,
            data: {
                courseDetails,
                totalDuration,
                completedVideos: courseProgressCount?.completedVideos
                    ? courseProgressCount?.completedVideos
                    : [],
            },
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// Get a list of Course for a given Instructor
exports.getInstructorCourses = async (req, res) => {
    try {
        // Get the instructor ID from the authenticated user or request body
        const instructorId = req.user.id

        // Find all courses belonging to the instructor
        const instructorCourses = await Course.find({
            instructor: instructorId,
        }).sort({ createdAt: -1 })

        // Return the instructor's courses
        res.status(200).json({
            success: true,
            data: instructorCourses,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Failed to retrieve instructor courses",
            error: error.message,
        })
    }
}


