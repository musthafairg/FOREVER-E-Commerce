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
      subject:"Verify your account",
      text:`Your OTP is ${otp}`,
      html:`<b>Your OTP : ${otp}</b>`,

    })
    return info.accepted.length>0

  } catch (error) {
    
    console.error("Error sending email",error.message);
    return false;
    
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
                res.render("user/otpVerification");
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