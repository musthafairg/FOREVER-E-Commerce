import { createUser } from "../services/userServices.js";

export const signupUser = async (req, res) => {
  try {
    await createUser(req.body);
    res.redirect("/user/login");
  } catch (err) {
    res.render("user/signUp", { error: err.message });
  }
}

export const loadLogin=(req,res)=>{
    res.render("user/login")
}

export const loadSignUp=(req,res)=>{
    res.render("user/signUp")
}

export const loadEmailVerification=(req,res)=>{
    res.render("user/emailVerification")
}

export const loadOtpVerification=(req,res)=>{
    res.render("user/otpVerification")
}

export const loadChangePassword=(req,res)=>{
    res.render("user/changePassword")
}

export const changePassword=(req,res)=>{
    res.redirect('/user/login')
}






