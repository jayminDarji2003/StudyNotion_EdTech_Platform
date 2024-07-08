// PROFILE CONTROLLERS
const Profile = require("../models/Profile");
const User = require("../models/User");
const CourseProgress = require("../models/CourseProgress");
const Course = require("../models/Course");
const { uploadToCloudinary } = require("../utils/imageUploader");
const { convertSecondsToDuration } = require("../utils/secToDuration");

//* NOTE : There is no need to create profile because we already created profile in signup controller.

// update profile
exports.updateProfile = async (req, res) => {
    try {
        // fetch data
        const {
            dateOfBirth = "",
            about = "",
            contactNumber = "",
            gender = "",
        } = req.body

        // fetch userId
        const id = req.user.id;

        // find profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        // update profile
        profileDetails.gender = gender;
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.phoneNumber = contactNumber;
        const updatedProfile = await profileDetails.save();

        // Find the updated user details
        const updatedUserDetails = await User.findById(id)
            .populate("additionalDetails")
            .exec()

        // return response
        return res.status(200).json({
            success: true,
            message: "profile updated successfully",
            data: updatedUserDetails
        })
    } catch (error) {
        console.log("ERROR OCCURED WHILE UPDATING PROFILE");
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while updating profile",
        })
    }
}


// delete profile
exports.deleteAccount = async (req, res) => {
    try {
        // fetch user id
        const id = req.user.id;

        // validation
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }

        // delete profile
        const profileResponse = await Profile.findByIdAndDelete({ _id: user.additionalDetails })

        // remove from enrolled students
        for (const courseId of user.courses) {
            await Course.findByIdAndUpdate(
                courseId,
                { $pull: { enrolledStudents: id } },
                { new: true }
            )
        }

        // delete user
        const userResponse = await User.findByIdAndDelete({ _id: id })

        await CourseProgress.deleteMany({ userId: id })

        // return response
        return res.status(200).json({
            success: true,
            message: "User deleted successfully"
        })
    } catch (error) {
        console.log("ERROR OCCURED WHILE DELETING ACCOUNT");
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while deleting account",
        })
    }
}


// user details
exports.getAllUserDetails = async (req, res) => {
    try {
        // get id
        const id = req.params.id;

        // validation and  get user details
        const userDetails = await User.findById(id).populate("additionalDetails").exec();

        // console.log("USER DETAILS => ", userDetails);

        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        // return response 
        return res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: userDetails
        })
    } catch (error) {
        console.log("ERROR OCCURED WHILE GETTING USER DETAILS");
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while getting user details",
        })
    }
}


// update user profile image
exports.updateDisplayPicture = async (req, res) => {
    try {
        // get the image
        const displayPicture = req.files.displayPicture
        // console.log("DISPLAY PICTURE INFO => ",displayPicture)

        // get the user id
        const userId = req.user.id
        console.log("USER ID => ", req.user.id);

        // upload profile image to cloudinary
        const image = await uploadToCloudinary(
            displayPicture,
            process.env.FOLDER_NAME,
            1000,
            1000
        )

        // console.log("USER IMAGE DETAILS  => ", image)

        // update the user profile image
        const updatedProfile = await User.findByIdAndUpdate(
            { _id: userId },
            { image: image.secure_url },
            { new: true }
        )

        // return response
        return res.status(200).json({
            success: true,
            message: `Image Updated successfully`,
            data: updatedProfile,
        })
    } catch (error) {
        console.log("ERROR OCCURED WHILE UPDATING PROFILE PICTURE OF USER");
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while updating profile image",
            message: error.message,
        })
    }
}


// get enrolled courses details
exports.getEnrolledCourses = async (req, res) => {
    try {
        // get the user id
        const userId = req.user.id

        // get user data
        let userDetails = await User.findOne({
            _id: userId,
        })
            .populate({
                path: "courses",
                populate: {
                    path: "courseContent",
                    populate: {
                        path: "subSection",
                    },
                },
            })
            .exec()


        userDetails = userDetails.toObject()
        var SubsectionLength = 0
        for (var i = 0; i < userDetails.courses.length; i++) {
            let totalDurationInSeconds = 0
            SubsectionLength = 0
            for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
                totalDurationInSeconds += userDetails.courses[i].courseContent[
                    j
                ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
                userDetails.courses[i].totalDuration = convertSecondsToDuration(
                    totalDurationInSeconds
                )
                SubsectionLength +=
                    userDetails.courses[i].courseContent[j].subSection.length
            }
            let courseProgressCount = await CourseProgress.findOne({
                courseID: userDetails.courses[i]._id,
                userId: userId,
            })
            courseProgressCount = courseProgressCount?.completedVideos.length
            if (SubsectionLength === 0) {
                userDetails.courses[i].progressPercentage = 100
            } else {
                // To make it up to 2 decimal point
                const multiplier = Math.pow(10, 2)
                userDetails.courses[i].progressPercentage =
                    Math.round(
                        (courseProgressCount / SubsectionLength) * 100 * multiplier
                    ) / multiplier
            }
        }

        if (!userDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find user with id: ${userDetails}`,
            })
        }
        return res.status(200).json({
            success: true,
            data: userDetails.courses,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}


// instructor dashboard details
exports.instructorDashboard = async (req, res) => {
    try {

        // find course details for instructor
        const courseDetails = await Course.find({ instructor: req.user.id })

        const courseData = courseDetails.map((course) => {
            const totalStudentsEnrolled = course.enrolledStudents.length;
            const totalAmountGenerated = totalStudentsEnrolled * course.price

            // Create a new object with the additional fields
            const courseDataWithStats = {
                _id: course._id,
                courseName: course.courseName,
                courseDescription: course.courseDescription,
                // Include other course properties as needed
                totalStudentsEnrolled,
                totalAmountGenerated,
            }

            return courseDataWithStats
        })

        // return response
        res.status(200).json({
            success: true,
            message: "successfully get the data.",
            courses: courseData
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}