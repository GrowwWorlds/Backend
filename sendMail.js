const nodemailer = require("nodemailer")

exports.sendMail = async (mailOptions)=>{
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: "growwworlds@gmail.com",
          pass: "aeqryltksewqsdzj",
        },
      }); 

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Error sending email:', error.message);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

}

