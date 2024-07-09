// RATING AND REVIEW CONTROLLERS
const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");

// create rating and review
// createRatingAndReview
exports.createRatingAndReview = async (req, res) => {
    try {
        // fetch data
        const { rating, review, courseId } = req.body;
        const userId = req.user.id;

        // validate data
        if (!rating || !review || !courseId || !userId) {
            return res.status(404).json({
                success: false,
                message: "All fields are required, please try again"
            })
        }

        // check User enrolled in Course or not
        const courseDetails = await Course.findOne(
            {
                _id: courseId,
                enrolledStudents: {
                    $elemMatch: { $eq: userId },
                }
            }
        );
        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: "Sorry, you are not eligible to give review for this course."
            })
        }

        // check if user already given the review
        const alreadyReviewed = await RatingAndReview.findOne({
            user: userId,
            course: courseId
        })

        if (alreadyReviewed) {
            return res.status(403).json({
                success: false,
                message: "Sorry, you are already reviewed for this course."
            })
        }

        // create rating and review
        const newRatingAndReview = await RatingAndReview.create({
            user: userId,
            rating,
            review,
            course: courseId,
        })

        // update the course with the new rating and review
        const updatdCourseDetails = await Course.findByIdAndUpdate({ _id: courseId }, {
            $push: {
                ratingAndReview: newRatingAndReview._id,
            }
        },
            { new: true }
        )

        console.log("COURSE DETAILS => ", updatdCourseDetails)

        // return response
        return res.status(200).json({
            success: true,
            message: "Rating and review created successfully",
            data: newRatingAndReview
        })

    } catch (error) {
        console.log("ERROR OCCURED WHILE CREATING RATING AND REVIEW")
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "something went wrong while creating the rating and review"
        })
    }
}


// get average rating
// getAverageRating
exports.getAverageRating = async (req, res) => {
    try {
        // get course id
        const { courseId } = req.body;

        // calculate average rating
        const result = await RatingAndReview.aggregate([
            {
                $match: {
                    course: new mongoose.Types.ObjectId(courseId),  // converting string to ObjectId
                }
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" }
                }
            }
        ])

        // return the average rating 
        if (result.length > 0) {
            return res.status(200).json({
                success: true,
                message: "Successfully calculated average rating",
                averageRating: result[0].averageRating
            })
        }

        // if not rating
        return res.status(200).json({
            success: true,
            message: "Average rating is 0, no rating given till now",
            averageRating: 0
        })

    } catch (error) {
        console.log("ERROR OCCURED WHILE CALCULATING AVERAGE RATING");
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Unable to calculate average rating"
        })
    }
}

// get rating and review
// getAllRatingAndReview
exports.getAllRatingAndReview = async (req, res) => {
    try {
        const result = await RatingAndReview.find({})
            .sort({ rating: "desc" })  // sort rating by descending order
            .populate({
                path: "user",
                select: "firstName lastName email image",  // get only this details only
            })
            .populate({
                path: "Course",
                select: "courseName"  // just get only couseName only
            })
            .exec();

        if (!result) {
            return res.status(200).json({
                success: true,
                message: "There is no rating available",
                data: result
            })
        }

        console.log("ALL REVIEWS AND RATING => ", result);

        // return response
        return res.status(200).json({
            success: true,
            message: "Rating and review found successfully",
            data: result
        })

    } catch (error) {
        console.log("ERROR OCCURED WHILE FETCHING REVIEW AND RATING");
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Unable to fetch review and rating details",
            data: error.message
        })
    }
}