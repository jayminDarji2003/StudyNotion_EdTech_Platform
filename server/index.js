const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const courseRoutes = require("./routes/Course");
const contactUsRoute = require("./routes/Contact");
// const paymentRoutes = require("./routes/Payment");

require("dotenv").config();
const { dbConnect } = require("./config/database");
const { cloudinaryConnect } = require("./config/cloudinary");

const cookieParser = require("cookie-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload")
var colors = require('colors');

const PORT = process.env.PORT || 4000;

// database connect
dbConnect();

// add middleware
app.use(express.json());   // to parse JSON data
app.use(cookieParser());

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}))

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/temp"
}));

// connect to cloudinary
cloudinaryConnect();    

// routes mount
app.use("/api/v1/auth", userRoutes)
app.use("/api/v1/profile", profileRoutes)
app.use("/api/v1/course", courseRoutes)
app.use("/api/v1/reach", contactUsRoute);
// app.use("/api/v1/payment", paymentRoutes)

// default route
app.get("/", (req, res) => {
    return res.send(`Your server is successfully running on port ${PORT}`);
})


// listen the server
app.listen(PORT, (req, res) => {
    // console.log(chalk.yellow.inverse(`Your server is connected to ${PORT}`))
    console.log(`Your server is listening on port ${PORT}`.yellow.inverse)
})



// const express = require("express");
// const app = express();

// const userRoutes = require("./routes/User");
// const profileRoutes = require("./routes/Profile");
// const courseRoutes = require("./routes/Course");
// const contactUsRoute = require("./routes/Contact");
// // const paymentRoutes = require("./routes/Payment");

// require("dotenv").config();
// const { dbConnect } = require("./config/database");
// const { cloudinaryConnect } = require("./config/cloudinary");

// const cookieParser = require("cookie-parser");
// const cors = require("cors");
// const fileUpload = require("express-fileupload");
// var colors = require('colors');

// const PORT = process.env.PORT || 4000;

// // database connect
// dbConnect();

// // add middleware
// app.use(express.json());   // to parse JSON data
// app.use(cookieParser());

// app.use(cors({
//     origin: "http://localhost:3000",
//     credentials: true
// }));

// app.use(fileUpload({
//     useTempFiles: true,
//     tempFileDir: "/temp"
// }));

// // connect to cloudinary
// cloudinaryConnect();    

// // routes mount
// app.use("/api/v1/auth", userRoutes);
// app.use("/api/v1/profile", profileRoutes);
// app.use("/api/v1/course", courseRoutes);
// app.use("/api/v1/reach", contactUsRoute);
// // app.use("/api/v1/payment", paymentRoutes);

// // default route
// app.get("/", (req, res) => {
//     return res.send(`Your server is successfully running on port ${PORT}`);
// });

// // listen the server
// app.listen(PORT, () => {
//     console.log(`Your server is listening on port ${PORT}`.yellow.inverse);
// });
