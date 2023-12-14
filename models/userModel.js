const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
           
        },

        email: {
            type: String,
            trim: true,
            
        },

        password: {
            type: String,
            trim: true
        },

        
        role: {
            type: String,
            default:"job-seeker"
        },
        
        isVerified:{
            type:Boolean,
            default:false
        }
    //     profileImg:{
            
    //     public_id: {
    //         type: String,
    //       },
    //       url: {
    //         type: String,
    //       },
    // }

        
    }, { timestamps: true })

module.exports = mongoose.model("Users", userSchema);