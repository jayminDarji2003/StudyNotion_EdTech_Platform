const Category = require("../models/Category");

function getRandomInt(max) {
    return Math.floor(Math.random() * max)
}

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
        const allCategoriesDetails = await Category.find({});
        console.log("ALL CATEGORIES => ", allCategoriesDetails);

        // send response
        return res.status(200).json({
            success: true,
            message: "All categories were successfully retrieved",
            data: allCategoriesDetails
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
        const { categoryId } = req.body
        console.log("PRINTING CATEGORY ID: ", categoryId);
        // Get courses for the specified category
        const selectedCategory = await Category.findById(categoryId)
            .populate({
                path: "courses",
                match: { status: "Published" },
                populate: "ratingAndReviews",
            })
            .exec()

        //console.log("SELECTED COURSE", selectedCategory)
        // Handle the case when the category is not found
        if (!selectedCategory) {
            console.log("Category not found.")
            return res.status(404).json({
                success: false,
                message: "Category not found"
            })
        }
        // Handle the case when there are no courses
        if (selectedCategory.course.length === 0) {
            console.log("No courses found for the selected category.")
            return res.status(404).json({
                success: false,
                message: "No courses found for the selected category.",
            })
        }

        // Get courses for other categories
        const categoriesExceptSelected = await Category.find({
            _id: { $ne: categoryId },
        })
        let differentCategory = await Category.findOne(
            categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
                ._id
        )
            .populate({
                path: "courses",
                match: { status: "Published" },
            })
            .exec()
        //console.log("Different COURSE", differentCategory)
        // Get top-selling courses across all categories
        const allCategories = await Category.find()
            .populate({
                path: "courses",
                match: { status: "Published" },
                populate: {
                    path: "instructor",
                },
            })
            .exec()
        const allCourses = allCategories.flatMap((category) => category.course)
        const mostSellingCourses = allCourses
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 10)
        // console.log("mostSellingCourses COURSE", mostSellingCourses)
        res.status(200).json({
            success: true,
            data: {
                selectedCategory,
                differentCategory,
                mostSellingCourses,
            },
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        })
    }
}
