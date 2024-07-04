const Tag = require("../models/Tag");

// create Tag handler
exports.createTag = async (req, res) => {
    try {
        // fetch data from req.body
        const { tagName, tagDescription } = req.body;

        // validation
        if (!tagName || !tagDescription) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        // create entry in database
        const tagDetails = await Tag.create({
            tagName: tagName,
            tagDescription: tagDescription
        })

        console.log("TAG CREATED => ", tagDetails)

        // response send
        return res.status(200).json({
            success: true,
            message: "Tag created successfully"
        })

    } catch (error) {
        console.log("ERROR OCCURED WHILE CREATING TAG")
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while creating tag"
        })
    }
}


// get all Tag handler
exports.getAllTags = async (req, res) => {
    try {
        // getting all tags from database
        const allTagsDetails = await Tag.find({}, { tagName: true, tagDescription: true });
        console.log("ALL TAGS => ", allTagsDetails);

        // send response
        return res.status(200).json({
            success: true,
            message: "All tags were successfully retrieved"
        })

    } catch (error) {
        console.log("ERROR OCCURED WHILE FETCHING ALL TAG")
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while fetching tag"
        })
    }
}