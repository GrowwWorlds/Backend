
const userModel = require('../models/userModel');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validation = require('../validations/validation');
const cloudinary = require('cloudinary').v2;
const jwt = require("jsonwebtoken")
const otpModel = require("../models/userOtpModel.js");
const otpGenerator = require("otp-generator")
const { sendMail } = require('../sendMail.js');



// sending real mail 


/////// authentication with email and password ///

exports.register = async function (req, res) {
  try {
    let userData = req.body;

    let { name, email, password } = userData;

    if (Object.keys(userData).length == 0) {

      return res.status(400).send({ status: false, message: 'Please provide required fields' });
    }

    if (!name) {
      return res.status(400).send({ status: false, message: 'Name is mandatory' });
    }

    if (typeof name != 'string') {
      return res.status(400).send({ status: false, message: 'Name should be a string' });
    }

    name = userData.name = name.trim();

    if (name == '') {
      return res.status(400).send({ status: false, message: 'Please enter a valid name' });
    }

    if (!validation.validateName(name)) {
      return res.status(400).send({ status: false, message: 'Please provide a valid name' });
    }

    if (!email) {
      return res.status(400).send({ status: false, message: 'Email is mandatory' });
    }

    if (typeof email != 'string') {
      return res.status(400).send({ status: false, message: 'Email should be a string' });
    }

    email = userData.email = email.trim().toLowerCase();

    if (email == '') {
      return res.status(400).send({ status: false, message: 'Please enter a valid email' });
    }

    if (!validation.validateEmail(email)) {
      return res.status(400).send({ status: false, message: 'Please provide a valid email' });
    }

    if (!password) {
      return res.status(400).send({ status: false, message: 'Password is mandatory' });
    }

    if (typeof password != 'string') {
      return res.status(400).send({ status: false, message: 'Password should be a string' });
    }

    password = userData.password = password.trim();

    if (password == '') {
      return res.status(400).send({ status: false, message: 'Please provide a valid password' });
    }

    let hashing = bcrypt.hashSync(password, 10);
    userData.password = hashing;

    const userExist = await userModel.findOne({ email: email });

    if (userExist) {
      if (userExist.email == email) {
        return res.status(400).send({ status: false, message: 'Email already exists' });
      }
    }

    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });


    const userCreated = await userModel.create(userData);

  const otpdata =  await otpModel.create({ email: userCreated.email, otp:otp })

console.log(otpdata)

    //////////////////////  sending mail ////////////////////////
  
    const mailOptions = {
      from: process.env.email,
      to: userCreated.email,
      subject: 'Grow World Verification Code!',
      html: `
        <p>Hello ${userCreated.name},</p>
        <p>Welcome to Grow World! Your OTP verification code is: <strong>${otp}</strong>.</p>
        <p>Thank you for registering.</p>
      `,
    };

   await sendMail(mailOptions)

 

    ///////////////////////////////////////////////////////////////////


    return res.status(201).send({ status: true, message: 'User registered successfully check your email and verify yourself', data: userCreated });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ status: false, message: error.message });
  }
};

/////////// verify otp ////////////

exports.verifyEmail = async (req, res) => {

  try {

const { email, otp } = req.body;
console.log(email , otp)
    const user = await userModel.findOne({ email });
console.log(user.email)

    if (!user) {

      return res.status(404).json({ status: false, message: "User not found" });

    }

    const storedOTP = await otpModel.findOne({ email });

console.log("otpmodel", storedOTP)

    if (storedOTP && storedOTP.otp === otp) {

      user.isVerified = true;


  const token = jwt.sign({email:user.email , _id:user._id, role: user.role},process.env.JWT_SECRET_KEY)

  console.log(token)

      await user.save();

      await otpModel.findOneAndDelete({ email: email })

      return res.status(200).json({ status: true, message: "Email verified successfully",token:token });
    } else {
      return res.status(400).json({ status: false, message: "Invalid OTP" });
    }
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

//////////// resend otp ///////////

exports.resendOTP = async (req, res) => {
  try {

    const { email } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    const updatedOTP = await otpModel.findOneAndUpdate(
      { email: user.email },
      { otp: otp },
      { new: true }
    );

  
if(!updatedOTP){
  await otpModel.create({email:user.email , otp:otp})
}
/////////////////// sending verification email /////////
    
    const mailOptions = {
      from: process.env.email,
      to: user.email,
      subject: 'New OTP Verification Code',
      text: `Your new OTP verification code is: ${otp}`,
    };

    await sendMail(mailOptions)
   
res.status(200).json({status:false , message:"Please Check Your Mail"})

  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};


exports.loginUser = async function (req, res) {
  try {
    let data = req.body;
    let { email, password } = data;

    if (Object.keys(data).length == 0)

      return res.status(400).send({ status: false, message: "Please send data" });

    if (!email)

      return res.status(400).send({ status: false, message: "Please enter Emaill" });


    if (email != undefined && typeof email != "string")

      return res.status(400).send({ status: false, message: "Please enter Emaill in string format" });

    email = data.email = email.trim();

    if (email == "")

      return res.status(400).send({ status: false, message: "Please enter Email value" });

    if (!validation.validateEmail(email))

      return res.status(400).send({ status: false, message: "Please enter valid Email" });

    if (!password)

      return res.status(400).send({ status: false, message: "Please enter password" });

    if (password != undefined && typeof password != "string")

      return res.status(400).send({ status: false, message: "Please enter password in string format" });

    password = data.password = password.trim();

    if (password == "")

      return res.status(400).send({ status: false, message: "Please enter password" });

    // if (!validation.validatePassword(password))
    //   return res.status(400).send({ status: false, message: "Please enter valid password" });

    //

    let isUserExist = await userModel.findOne({ email: email });

    if (!isUserExist)

      return res.status(404).send({ status: false, message: "No user found with given Email", });


    if (!isUserExist.isVerified) {
      return res.status(400).send({ status: false, message: "Email is not verified. Please verify your email" });
    }


    //Decrypt
    let passwordCompare = await bcrypt.compare(password, isUserExist.password);

    if (!passwordCompare) return res.status(400).send({ status: false, message: "Please enter valid password" })

    console.log(isUserExist.role)
    let token = jwt.sign(
      { _id: isUserExist._id, role: isUserExist.role },
      process.env.JWT_SECRET_KEY
    );


    return res.status(200).send({ status: true, message: "User login successfull", data: token });

  } catch (err) {
    return res.status(500).send({ status: false, error: err.message });
  }
};

exports.forgetpassword = async function (req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({ status: false, message: 'Email is mandatory' });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const otp =otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    await otpModel.findOneAndDelete({ email });
     
    await otpModel.create({ email, otp });

    const mailOptions = {
      from: process.env.email,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}`,
    };

    await sendMail(mailOptions)

    res.status(200).json({status:false , message:"Please Check Your Mail"})

  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};


exports.resetPassword = async function (req, res) {
  try {
    
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).send({ status: false, message: 'Please provide email, OTP, and new password' });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const storedOTP = await otpModel.findOne({ email });

    if (!storedOTP || storedOTP.otp !== otp) {
      return res.status(400).json({ status: false, message: "Invalid OTP" });
    }

    // Reset password
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Remove OTP after successful password reset

    await otpModel.findOneAndDelete({ email });

    return res.status(200).json({ status: true, message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};


// user should be authenticated 


exports.changePassword = async (req, res) => {
  try {

    const userId = req.user._id

    const {oldPassword,newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ status: false, message: 'Please provide email, old password, and new password' });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isOldPasswordValid) {
      return res.status(400).json({ status: false, message: 'Invalid old password' });
    }

    // Update password
    const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    return res.status(200).json({ status: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ status: false, message: error.message });
  }
};


exports.getUser = async function (req, res){
  try {
    let userId = req.user._id
    if(req.user.role != "job-seeker"){
      return res.status(403).json({status:false , message:"unauthorize access"})
    }
    let userData = await userModel.findById(userId)

    if (!userData) { return res.status(404).send({ status: false, message: "User is not found" }) }

    return res.status(200).send({ status: true, message: "User profile details", data: userData })
  }
  catch (err) {
    return res.status(500).send({ status: false, error: err.message });
  }
}
 


exports.updateUser = async function (req, res){
  try {
    const userId = req.user._id
    let userData = req.body
    let { name, email} = userData

    if(req.user.role != "job-seeker"){
      return res.status(403).json({status:false , message:"unauthorize access"})
    }



    if (name) {
      if (typeof name != "string")
        return res.status(400).send({ status: false, message: "first name should be in string" });

      name = userData.name = name.trim();

      if (name == "") return res.status(400).send({ status: false, message: "Please Enter first name value" });

      if (!validation.validateName(name))
        return res.status(400).send({ status: false, message: "please provide valid first name " });
    }


    if (name) {
    
    if (typeof name != 'string') {
      return res.status(400).send({ status: false, message: 'Name should be a string' });
    }

    name = userData.name = name.trim();

    if (name == '') {
      return res.status(400).send({ status: false, message: 'Please enter a valid name' });
    }

    if (!validation.validateName(name)) {
      return res.status(400).send({ status: false, message: 'Please provide a valid name' });
    }
  }

    if (email) {
    
    if (typeof email != 'string') {
      return res.status(400).send({ status: false, message: 'Email should be a string' });
    }

    email = userData.email = email.trim().toLowerCase();

    if (email == '') {
      return res.status(400).send({ status: false, message: 'Please enter a valid email' });
    }
const checkEmail = await userModel.findById(userId)

if(checkEmail.email !== email){
  return res.status(400).json({status:false , message:"invailed Email"})

}

    // if (!validation.validateEmail(email)) {
    //   return res.status(400).send({ status: false, message: 'Please provide a valid email' });
    // }
  }
    
/* 
const existFile = await userModel.findById(userId)

console.log(existFile)

if (req.files && req.files.resume) {
  if (existFile.resume && existFile.resume.public_id) {
    await cloudinary.uploader.destroy(existFile.resume.public_id);
  }

  const resumeFile = req.files.resume;

  const uploadedFile = await cloudinary.uploader.upload(resumeFile.tempFilePath, {
    folder: 'resumes',
  });

  userData.resume = {
    public_id: uploadedFile.public_id,
    url: uploadedFile.secure_url,
  };
}
 */
/* if (req.files && req.files.profileImg) {
  if (existFile.profileImg && existFile.profileImg.public_id) {
    await cloudinary.uploader.destroy(existFile.profileImg.public_id);
  } */

  // const profileImage = req.files.profileImg;

//   const uploadedFile = await cloudinary.uploader.upload(profileImage.tempFilePath, {
//     folder: 'profiles',
//   });

//   userData.profileImg = {
//     public_id: uploadedFile.public_id,
//     url: uploadedFile.secure_url,
//   };
// }
  

    const updatedUser = await userModel.findByIdAndUpdate({ _id: userId },
      {
      ...userData
      }, { new: true });

    return res.status(200).send({ status: true, message: "User profile updated", data: updatedUser })

  } catch (error) {
    return res.status(500).send({ status: false, data: error.message })
  }
}







