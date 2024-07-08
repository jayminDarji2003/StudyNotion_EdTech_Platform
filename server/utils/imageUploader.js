const cloudinary = require("cloudinary").v2;
require("dotenv").config();

exports.uploadToCloudinary = async (file, folder, height, quality) => {
    const options = { folder };
    if (height) {
        options.height = height;
    }
    if (quality) {
        options.quality = quality;
    }

    // set resource type
    options.resource_type = "auto";

    try {
        const result = await cloudinary.uploader.upload(file.tempFilePath, options);
        // console.log("FILE UPLOADED RESULT => ", result);
        return result;
    } catch (error) {
        console.log("ERROR IN FILE UPLOAD TO Cloudinary");
        console.error(error);
        throw error;
    }

}