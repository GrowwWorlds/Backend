
credentials = require('./middi/credentials.js');
const corsOptions = require('./config/corsOptions.js');
const express =require("express")
const fileUpload = require('express-fileupload');
const cloudinary = require("cloudinary").v2;
const cors = require("cors")
const app = express()


app.use(fileUpload({
    useTempFiles:true
}))
 
 
app.use(express.json())


// app.use(cors({
//   origin: "http://localhost:3000",
//   // origin: "https://ssu-admin.netlify.app",
// }))

app.use(cors(corsOptions));

  

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME ,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
  });
   

//////  routing will be here ///////

// User Routes
const userAuthRoute = require("./routes/userAuthRoute.js");


// User Route Usage
app.use("/user/auth", userAuthRoute);

module.exports = app;











/* 
const blogData = require("./routes/blogRoute")
app.use("/admin", blogData)



const user = require("./routes/userRoute")
app.use("/user", user)




const adminSuggestion = require("./routes/adminSuggesstionRoute.js")
app.use("/admin", adminSuggestion)


const admin = require("./routes/adminRoute")
app.use("/admin", admin)


const dummyTemplate = require("./routes/adminDummy")
app.use("/adminDummy", dummyTemplate)


const ResumeExample = require("./routes/resumeExampleRoute")
app.use("/adminContent", ResumeExample)


 */
