// PROFILE CONTROLLERS
const Profile = require("../models/Profile");
const User = require("../models/User");

//* NOTE : There is no need to create profile because we already created profile in signup controller.

// update profile
exports.updateProfile = async (req, res) => {
    try {
        // fetch data
        const { gender, dataOfBirth, about } = req.body;

        // fetch userId
        const id = req.user.id;

        // validation
        if (!id || !gender || !dataOfBirth || !about) {
            return res.status(404).json({
                success: false,
                message: "Update profile failed, all fields are required"
            })
        }

        // find profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        // update profile
        profileDetails.gender = gender;
        profileDetails.dataOfBirth = dataOfBirth;
        profileDetails.about = about;
        const updatedProfile = await profileDetails.save();

        // return response
        return res.status(200).json({
            success: true,
            message: "profile updated successfully",
            data: updatedProfile
        })
    } catch (error) {
        console.log("ERROR OCCURED WHILE UPDATING PROFILE");
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while updating profile",
        })
    }
}


// delete profile
exports.deleteAccount = async (req, res) => {
    try {
        // fetch user id
        const id = req.user.id;

        // validation
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }

        // delete profile
        const profileResponse = await Profile.findByIdAndDelete({ _id: user.additionalDetails })

        // remove from enrolled students

        // delete user
        const userResponse = await User.findByIdAndDelete({ _id: id })

        // return response
        return res.status(200).json({
            success: true,
            message: "User deleted successfully"
        })
    } catch (error) {
        console.log("ERROR OCCURED WHILE DELETING ACCOUNT");
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while deleting account",
        })
    }
}


// user details
exports.getAllUserDetails = async (req, res) => {
    try {
        // get id
        const id = req.params.id;

        // validation and  get user details
        const userDetails = await User.findById(id).populate("additionalDetails").exec();
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        // return response 
        return res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: userDetails
        })
    } catch (error) {
        console.log("ERROR OCCURED WHILE GETTING USER DETAILS");
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while getting user details",
        })
    }
}