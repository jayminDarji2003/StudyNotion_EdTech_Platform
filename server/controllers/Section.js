// SECTION CONTROLLER
const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection = require("../models/SubSection")

// create section
exports.createSection = async (req, res) => {
    try {
        // data fetch
        const { sectionName, courseId } = req.body;

        // data validation
        if (!sectionName || !courseId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        // create section - entry in database 
        const sectionDetails = await Section.create({
            sectionName: sectionName,
            // subSection: []
        })


        // entry in COURSE database
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            {
                $push: {
                    courseContent: newSection._id,
                },
            },
            { new: true }
        )
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec();

        // return response
        return res.status(200).json({
            success: true,
            message: "section created successfully",
            updatedCourse
        })


    } catch (error) {
        console.log("ERROR OCCURED WHILE CREATING SECTION")
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while creating section"
        })
    }
}

// update section
exports.updateSection = async (req, res) => {
    try {
        // fetch data
        const { sectionName, sectionId, courseId } = req.body;

        // data validation
        if (!sectionName || !sectionId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        // update data
        const updatedSection = await Section.findByIdAndUpdate(sectionId,
            {
                sectionName: sectionName
            },
            { new: true }
        )

        // get course data
        const course = await Course.findById(courseId)
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec();

        // return response
        return res.status(200).json({
            success: true,
            message: "section updated successfully",
            course
        })

    } catch (error) {
        console.log("ERROR OCCURED WHILE UPDATING SECTION")
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while updating section"
        })
    }
}

// delete section
exports.deleteSection = async (req, res) => {
    try {
        //fetch section id
        // getting id from params
        const { sectionId, courseId } = req.params;

        // get section data
        const section = await Section.findById(sectionId);

        // validate section
        if (!section) {
            return res.status(404).json({
                success: false,
                message: "Section not Found",
            })
        }

        // delete section
        const deletedSection = await Section.findByIdAndDelete(sectionId)

        // update course
        const updatedCourse = await Course.findByIdAndUpdate(courseId, {
            $pull: {
                courseContent: sectionId,
            }
        })



        //delete sub section
        const updatedSubSection = await SubSection.deleteMany({ _id: { $in: section.subSection } });

        //find the updated course and return 
        const course = await Course.findById(courseId).populate({
            path: "courseContent",
            populate: {
                path: "subSection"
            }
        })
            .exec();

        // return response
        return res.status(200).json({
            success: true,
            message: "section deleted successfully",
            course
        })
    } catch (error) {
        console.log("ERROR OCCURED WHILE DELETING SECTION")
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while deleting section"
        })
    }
}