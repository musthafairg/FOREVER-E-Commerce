

import 'dotenv/config'
import nodemailer from 'nodemailer'
import User from "../../models/userModel.js"
import bcrypt from 'bcrypt'

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

export const signupUser=async (req,res)=>{
  try {
    const {name,mobile,email,password}=req.body;

    const existingUser=await User.findOne({email});
    if(existingUser){
      return res.render("user/signup",{error:"User already exists"})
    }

    const otp=generateOtp()

    const emailSent=await sendVerificationEmail(email,otp)

    if(!emailSent){
      return res.json("email-error")
    }

    req.session.userOtp=otp;
    req.session.userData={name,mobile,email,password}
    res.render("user/otpVerification")
    console.log("OTP Sent ",otp);
    
  } catch (error) {
    console.error("signup error");
    res.redirect("user/pageNotFound")
  }
}

const securePassword= async (password)=>{
  try {
    
    const passwordHash=await bcrypt.hash(password,10)
    return passwordHash;
  } catch (error) {
    
  }
}


export const verifyOtp= async (req,res)=>{

  try {
    const {otp}=req.body
    console.log(otp);

    if(otp===req.session.userOtp){
      const user=req.session.userData
      const passwordHash=await securePassword(user.password)

      const saveUserData= new User({
        name:user.name,
        email:user.email,
        mobile:user.mobile,
        password:passwordHash,
      })
      await saveUserData.save();
      req.session.user=saveUserData.id;
      res.json({success:true,redirectUrl:"/login"})
    }else{
      res.status(400).json({success:false,message:"Invalid OTP, Please try again"})
    }

    
  } catch (error) {
    
    console.error("Error Verifying OTP",error);
    res.status(500).json({success:false,message:"An error occured"})
    
  }
}


export const resendOtp= async(req,res)=>{
  try {
    const {email}=req.session.userData;
    if(!email){
      return res.status(400).json({success:false,message:"Email not found in session"})

    }
    const otp= generateOtp();
    req.session.userOtp=otp;

    const emailSent=await sendVerificationEmail(email,otp);
    if(emailSent){
      console.log("Resend OTP: ",otp);
      res.status(200).json({success:true,message:"OTP Resend Successfully"})
      
    }else{
      res.status(500).json({success:false,message:"Failed to resnd OTP. Please try again"})
    }

  } catch (error) {

    console.error("Error resending OTP",error);
    res.status(500).json({success:false,message:"Internal Server Error. Please try again"})
    
    
  }
}



export const loadSignup = async (req,res)=>{
  try {
    
    return res.render("user/signup")
  } catch (error) {
    console.log("Signup page not Loading");
    
    res.status(500).send("Server Error")
  }

}

export const loadHomepage=async (req,res)=>{
  try {

    const user=req.session.user;
    if(user){
      const userData=await User.findOne({id:user.id});
      res.render("user/home",{user:userData})
    }else{
       return res.render("user/home")
    }
   
  } catch (error) {
    console.error("Home page not loading");

    res.redirect("user/pageNotFound")
      
  }
}

export const loadLogin = async (req,res)=>{
  try {
if(!req.session.user){
   return res.render("user/login")
}else{
 return res.redirect("/")
}
   
  } catch (error) {
    console.log("Login page not Loading");
    
    res.redirect("user/pageNotFound")
  }

}


export const login= async(req,res)=>{

  try {
    const {email,password}=req.body;

    const findUser=await User.findOne({isAdmin:0,email:email})

  if(!findUser)
    return res.render("user/login",{error:"User not found"})

  if(findUser.isBlocked){
    return res.render("user/login",{error:"User is blocked by admin"})
  }

  const passwordMatch=await bcrypt.compare(password,findUser.password)

  if(!passwordMatch){
    return res.render("user/login",{error:"Incorrect Password"})


  }

  req.session.user=findUser.id;
  res.redirect("/")


} catch (error) {
    
  console.error("Login error");
  res.render("user/login",{error:"Login failed. Please try again later"})
  
  }
}


export const loadPageNotFound=async(req,res)=>{
  try {
res.render("user/pageNOtFound")
  } catch (error) {
    res.redirect("user/pageNotFound")
  }
}


export const logout= async(req,res)=>{
  try {
    req.session.destroy((err)=>{
      if(err){
        console.log("Session destruction error",err.message);
        return res.redirect("/pageNotFound")
      }
      return res.redirect("/login")
    })
  } catch (error) {
    console.log("Logout error",error)
    res.redirect("/pageNotFound")
  }
}




