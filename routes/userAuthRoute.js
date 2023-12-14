const express = require("express")

let router = express.Router()

const { register, loginUser, getUser, updateUser, signUp, verifyOtp, verifyEmail, resendOTP, forgetpassword, resetPassword, changePassword } = require("../controllers/userController")
const { authentication } = require("../middi/auth")


////////////////// User Route ////////////////

////////////////// user ////////////////////////

router.route("/register").post(register)
router.route("/verify").post(verifyEmail)
router.route("/resendOtp").post(resendOTP)
router.route("/forgetPass").post(forgetpassword)
router.route("/resetPassword").post(resetPassword)
router.route("/changePass").post(authentication, changePassword)
router.route("/changePassword").post(authentication,changePassword)
router.route("/logIn").post(loginUser)
router.route('/profile').get(authentication, getUser);

router.route("/updateProfile").put(authentication, updateUser)



router.all('*/', function (req, res) {
    return res.status(400).send({ status: false, message: "Invalid url Path" })
})


module.exports = router