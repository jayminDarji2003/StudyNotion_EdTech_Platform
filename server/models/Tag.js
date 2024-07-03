const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema({
    tagName: {
        type: String,
        required: true,
        trim: true
    },
    tagDescription: {
        type: String,
        trim: true
    },
    course: {   
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"   
    }
});


module.exports = mongoose.model("Tag", tagSchema);
