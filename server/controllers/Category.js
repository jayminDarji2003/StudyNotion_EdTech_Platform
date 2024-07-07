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

// category page details handler fnx
exports.categoryPageDetails = async (req, res) => {
    try {
        // get categoryId
        const { catgegoryId } = req.body;

        // get courses for specified categoryId  (1)
        const selectedCategory = await Category.findById(catgegoryId)
            .populate("course")
            .exec();

        // validation
        if (!selectedCategory) {
            return res.status(404).json({
                success: false,
                message: "Data not found for category"
            })
        }

        // get courses for different categories (2)
        const differentCategories = await Category.find({ _id: { $ne: catgegoryId } })
            .populate("course")
            .exec();

        // get top selling courses (3)
        // HW

        // return response
        return res.status(200).json({
            success: true,
            message: "Data fetched successfully",
            data: {
                selectedCategory,
                differentCategories
            }
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
