// SUBSECTION HANDLER
const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadToCloudinary } = require("../utils/imageUploader");
require("dotenv").config();

// create sub-section
exports.createSubSection = async (req, res) => {
    try {
        // fetch data from req.body
        const { sectionId, title, timeDuration, description } = req.body;

        // extract file/video from req.file
        const video = req.file.videoFile;

        // validation   
        if (!sectionId || !title || !timeDuration || !description || !video) {
            return res.status(400).json({
                success: false,
                message: "All fields must be required."
            })
        }

        // upload video to cloudinary
        const videoUploadDetails = await uploadToCloudinary(videoUrl, process.env.FOLDER_NAME)

        // create sub-section
        const subSectionDetails = await SubSection.create({
            title: title,
            timeDuration: `${videoUploadDetails.duration}`,
            description: description,
            videoUrl: videoUploadDetails.secure_url
        })

        // entry in SECTION database (update)
        const updatedSection = await Section.findByIdAndUpdate({ _id: sectionId },
            {
                $push: {
                    subSection: subSectionDetails._id
                }
            },
            { new: true }
        ).pupulate("subSection").exec();

        // return response
        return res.status(200).json({
            success: true,
            message: "Sub-section created successfully",
            data : updatedSection
        })
    } catch (error) {
        console.log("ERROR OCCURED WHILE CREATING SUB-SECTION")
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error occured while creating sub-section"
        })
    }
}

// update sub-section
exports.updateSubSection = async (req, res) => {
    try {
        const { sectionId, subSectionId, title, description } = req.body
        const subSection = await SubSection.findById(subSectionId)

        if (!subSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            })
        }

        if (title !== undefined) {
            subSection.title = title
        }

        if (description !== undefined) {
            subSection.description = description
        }
        if (req.files && req.files.video !== undefined) {
            const video = req.files.video
            const uploadDetails = await uploadToCloudinary(
                video,
                process.env.FOLDER_NAME
            )
            subSection.videoUrl = uploadDetails.secure_url
            subSection.timeDuration = `${uploadDetails.duration}`
        }

        await subSection.save()

        // find updated section and return it
        const updatedSection = await Section.findById(sectionId).populate(
            "subSection"
        )

        console.log("updated section", updatedSection)

        return res.json({
            success: true,
            message: "Section updated successfully",
            data: updatedSection,
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "An error occurred while updating the section",
        })
    }
}

// delete sub section
exports.deleteSubSection = async (req, res) => {
    try {
        const { subSectionId, sectionId } = req.body
        await Section.findByIdAndUpdate(
            { _id: sectionId },
            {
                $pull: {
                    subSection: subSectionId,
                },
            }
        )
        const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })

        if (!subSection) {
            return res
                .status(404)
                .json({ success: false, message: "SubSection not found" })
        }

        // find updated section and return it
        const updatedSection = await Section.findById(sectionId).populate(
            "subSection"
        )

        return res.json({
            success: true,
            message: "SubSection deleted successfully",
            data: updatedSection,
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "An error occurred while deleting the SubSection",
        })
    }
}