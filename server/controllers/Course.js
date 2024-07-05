// COURSE CONTROLLERS

const Course = require("../models/Course")
const Category = require("../models/Category")
const User = require("../models/User");
const { uploadToCloudinary } = require("../utils/imageUploader");

// create course handler 
exports.createCourse = async (req, res) => {
    try {
        // fetch data from req.body
        const { courseName, courseDescription, whatYouWillLearn, price, tag, categoryId } = req.body;

        // fetch file(thumbnail) from req.file
        const thumbnail = req.file.thumbnailImage;

        // validation
        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !categoryId) {
            return res.status(400).json({
                success: false,
                message: "All fields must be required."
            })
        }

        // instructor details
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log("INSTRUCTOR DETAILS => ", instructorDetails)

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
        const thumbnailImage = await uploadToCloudinary(thumbnail, process.env.FOLDER_NAME);

        // start entry in database
        // entry in course db
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn,
            price,
            thumbnail: thumbnailImage.secure_url,
            tag: tag,
            category: categoryDetails._id,
        })
        console.log("NEW COURSE CREATED SUCCESSFULLY => ", newCourse)

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

        console.log("INSTRUCTOR UPDATED SUCCESSFULLY => ", userResponse)

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

        console.log("CATEGORY UPDATED SUCCESSFULLY => ", categoryResponse)

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



// get all courses handler
exports.showAllCourses = async (req, res) => {
    try {
        // get all courses
        const courses = await Course.find();

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