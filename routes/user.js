import express from 'express' 
const router=express.Router()
import {logout,loadSignup,signupUser,loadLogin,verifyOtp,resendOtp,loadPageNotFound,login,loadHomepage} from '../controller/user/userController.js'
import passport from '../config/passport.js'



router.get('/signUp',loadSignup)
router.post('/signUp',signupUser)
router.post("/verify-otp",verifyOtp)
router.post("/resend-otp",resendOtp)

router.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}))
router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/signup'}),(req,res)=>{
    res.redirect('/')
})

 
router.get('/login',loadLogin)
router.post('/login',login)

router.get('/',loadHomepage)
router.get('/logout',logout)

router.get("/pageNotFound",loadPageNotFound)


export default router
