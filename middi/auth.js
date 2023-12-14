
const jwt = require("jsonwebtoken")

// const Payment = require("../models/coursePayment")
// const Course = require("../models/courseModel")
//==================== authentication ===============================

  
exports.authentication = function (req, res, next){

    let token = req.headers["x-auth-token"]

if(!token) {return res.status(400).send({status:false , message:"Please verify yourself "})}

jwt.verify(token , process.env.JWT_SECRET_KEY, async function(err, decoded){

    if(err) {

    return res.status(401).send({status:false , message: err.message})

    }

else {

    req.user = decoded 
    console.log(req.user.role)
    console.log(req.user.userId)
    req.role = decoded.role
    const role = req.role
    console.log(role)
    next()
    
}

})

}

// ======================= adimin authorizartion ====================


exports.authorization = async (req, res, next )=>{
    let role = req.role
console.log(role)
    if(role != "admin"){
     return   res.status(403).send({status:false, message:"Unauthorize Access"})
    }
    next()
}




//////////////// course access ////////////////////////////



////////////// payment for particular video ///////////

/* exports.enrollUserInCourse = async (req, res, next) => {
    try {
      const courseId = req.params.courseId;
      const userId = req.user._id;
  if(req.user.role != "job-seeker"){
return res.status(403).json({status:false , message:"Unauthorize Access"})
  }
     
      const payment = await Payment.findOne({ courseId, userId });
  
      const checkIsPaid = await Course.findById(courseId)

      
      if (payment || (checkIsPaid.isPaid==false)) {
        
        next()
       
      } else {
       
        return res.status(403).json({ error: 'You need to purchase the course to access it.' });
      }
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while checking course access.' });
    }
  };
 */
  



