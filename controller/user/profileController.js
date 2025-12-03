import User from "../../models/userModel.js";
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import 'dotenv/config';
import session from "express-session";


function generateOtp(){
  return Math.floor(100000+Math.random()*900000).toString();
}

async function sendVerificationEmail(email,otp){
  try {
    const transporter=nodemailer.createTransport({
      service:'gmail',
    
      auth:{
        user:process.env.NODEMAILER_EMAIL,
        pass:process.env.NODEMAILER_PASSWORD
      }
    })

    const info=await transporter.sendMail({
      from:process.env.NODEMAILER_EMAIL,
      to:email,
      subject:"Your OTP for password reset",
      text:`Your OTP is ${otp}`,
      html:`<b><h4>Your OTP : ${otp}</h4><br></b>`,

    })
    return info.accepted.length>0

  } catch (error) {
    
    console.error("Error sending email",error.message);
    return false;
    
  }
}

const securePassword= async (password)=>{
  try {
    
    const passwordHash=await bcrypt.hash(password,10)
    return passwordHash;
  } catch (error) {
    
  }
}



export const getForgotPasswordPage=async(req,res)=>{
    try {
        res.render("user/forgot-password")
    } catch (error) {
        res.redirect("/pageNotFound")
    }
}


export const forgotEmailValid= async(req,res)=>{
    try {
        const {email}=req.body;
        const findUser= await User.findOne({email:email});
        if(findUser){
            const otp=generateOtp();  
            const emailSent=await sendVerificationEmail(email,otp);
            if(emailSent){
                req.session.userOtp=otp;
                req.session.email=email;
                req.session.otpExpires = Date.now() + 60 * 1000; // valid for 60 seconds
                res.render("user/forgot-pass-otp");
                console.log("OTP :",otp);

             }else{
                res.json({success:false,message:"Failed to send OTP.Please try again"})

             }
        }else{
            res.render("user/forgot-password",{message:"User with this email does not exist"})
        }
    } catch (error) {
        res.redirect("/pageNotFound")
    }
}







export const verifyOtpPass = async (req, res) => {
  try {
    const { otp } = req.body;

    // Check expiration
    if (Date.now() > req.session.otpExpires) {
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please resend OTP."
      });
    }

    // Check OTP value
    if (otp === req.session.userOtp) {

   

      // Clear OTP session
      req.session.userOtp = null;
      req.session.otpExpires = null;

      return res.json({ success: true, redirectUrl: "/reset-password" });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid OTP. Please try again."
    });

  } catch (error) {
    console.error("Error verifying OTP", error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
};




 export const getRestPassPage=async(req,res)=>{
  try {
    res.render("user/changePassword")
  } catch (error) {
    res.redirect("/pageNotFound")
  }
 }



 
 export const resendOtpPass = async (req, res) => {
   try {
    
     const email=req.session.email;
     console.log(req.session);
     
 
     const otp = generateOtp();
     req.session.userOtp = otp;
     req.session.otpExpires = Date.now() + 60 * 1000; // new 60s window for the new OTP
 
     const emailSent = await sendVerificationEmail(email, otp);
 
     if (emailSent) {
       console.log("Resend OTP:", otp);
       return res.status(200).json({
         success: true,
         message: "OTP resent successfully"
       });
     } else {
       return res.status(500).json({
         success: false,
         message: "Failed to resend OTP. Please try again"
       });
     }
 
   } catch (error) {
     console.error("Error resending OTP", error);
     return res.status(500).json({
       success: false,
       message: "Internal Server Error. Please try again"
     });
   }
 };
 

 export const postNewPassword=async(req,res)=>{
  try {
    const {newPass1,newPass2}=req.body;
    const email=req.session.email;
console.log(email);

    if(newPass1===newPass2){
      const passwordHash=await securePassword(newPass1);
        const userDataBefore=await User.findOne({email:email});
      console.log("Before",userDataBefore.password);
      
      const userData=await User.findOneAndUpdate({email},{ password: passwordHash },
  { new: true })
        console.log("after",userData.password);
      
      res.redirect("/login")
    }
  } catch (error) {
    
  }
 }