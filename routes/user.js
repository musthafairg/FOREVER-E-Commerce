import express from 'express' 
const router=express.Router()
import {filterByPrice,searchProducts,filterProduct,logout,loadSignup,signupUser,loadLogin,verifyOtp,resendOtp,loadPageNotFound,login,loadHomepage,loadShoppingPage} from '../controller/user/userController.js'
import passport from '../config/passport.js'
import {getForgotPasswordPage,forgotEmailValid,verifyOtpPass,getRestPassPage,resendOtpPass,postNewPassword}from '../controller/user/profileController.js'
import {userAuth} from '../middleware/auth.js'
import {productDetailes}from '../controller/user/productController.js'

//signup Management
router.get('/signUp',loadSignup)
router.post('/signUp',signupUser)
router.post("/verify-otp",verifyOtp)
router.post("/resend-otp",resendOtp)
 router.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}))
router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/signup'}),(req,res)=>{
    res.redirect('/')
})

//Login Management
router.get('/login',loadLogin)
router.post('/login',login)
router.get('/logout',logout)

//Home Page & Shopping page
router.get('/',userAuth,loadHomepage)
router.get("/shop",userAuth,loadShoppingPage);
router.get("/filter",userAuth,filterProduct);
router.get("/filterPrice",userAuth,filterByPrice)
router.post("/search",userAuth,searchProducts)

//Product Management
router.get("/productDetails",userAuth,productDetailes)

//Profile Management
router.get("/forgot-password",getForgotPasswordPage)
router.post("/forgot-email-valid",forgotEmailValid)
router.post("/verify-otp-pass",verifyOtpPass)
router.post("/resend-otp-pass",resendOtpPass)
router.get("/reset-password",getRestPassPage)
router.post("/reset-password",postNewPassword)


//Error Management
router.get("/pageNotFound",loadPageNotFound)


export default router
