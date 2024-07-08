const mongoose = require("mongoose");
require("dotenv").config();
var colors = require('colors');

exports.dbConnect = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGODB_URL);
        console.log("DATABASE CONNECTED SUCCESSFULLY".green.inverse)
    } catch (error) {
        console.log("ERROR OCCURED WHILE CONNECTING TO MONGODB DATABASE".red.inverse)
        console.error(error)
        process.exit(1);
    }
}


