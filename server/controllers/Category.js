const Category = require("../models/Category");

// create category handler
exports.createCategory = async (req, res) => {
    try {
        // fetch data from req.body
        const { categoryName, categoryDescription } = req.body;

        // validation
        if (!categoryName || !categoryDescription) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        // create entry in database
        const categoryDetails = await Category.create({
            categoryName: categoryName,
            categoryDescription: categoryDescription
        })

        console.log("CATEGORY CREATED SUCCESSFULLY => ", categoryDetails)

        // response send
        return res.status(200).json({
            success: true,
            message: "category created successfully"
        })

    } catch (error) {
        console.log("ERROR OCCURED WHILE CREATING CATEGORY")
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while creating category"
        })
    }
}


// show all categories handler
exports.showAllCategory = async (req, res) => {
    try {
        // getting all category from database
        const allCategoriesDetails = await Category.find({}, { categoryName: true, categoryDescription: true });
        console.log("ALL CATEGORIES => ", allCategoriesDetails);

        // send response
        return res.status(200).json({
            success: true,
            message: "All categories were successfully retrieved"
        })

    } catch (error) {
        console.log("ERROR OCCURED WHILE FETCHING ALL CATEGORY")
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while fetching category"
        })
    }
}