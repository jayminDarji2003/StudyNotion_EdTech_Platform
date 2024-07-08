const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    gender: {
        type: String,
        enum: ["male", "female", "other"],
    },
    dateOfBirth: {
        type: String,
    },
    about: {
        type: String,
        trim: true,
    } , 
    phoneNumber: {
        type: String,
    }
}, { timestamps: true });

module.exports = mongoose.model("Profile", profileSchema);