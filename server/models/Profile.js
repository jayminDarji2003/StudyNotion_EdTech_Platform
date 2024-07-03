const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    gender:{
        type: String,
        enum: ["male", "female","other"],
    },
    dataOfBirth: {
        type: String,
    },
    about: {
        type: String,
        trim: true,
    }
});

module.exports = mongoose.model("Profile", profileSchema);