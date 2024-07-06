// RATING AND REVIEW CONTROLLERS
const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");

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

// get rating and review
// getAllRatingAndReview