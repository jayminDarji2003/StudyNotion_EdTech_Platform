const mongoose = require("mongoose");

const courseProgressShcema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    completedVideo: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubSection"
        }
    ]
},  { timestamps: true });


module.exports = mongoose.model("CourseProgress", courseProgressShcema);