import express from 'express' 
const router=express.Router()
import {loadLogin,loadSignUp,loadEmailVerification,loadOtpVerification,loadChangePassword,changePassword,signupUser} from '../controller/userController.js'


router.get('/login',loadLogin)
router.get('/signUp',loadSignUp)
router.post('/signUp',signupUser)
router.get('/verify-email',loadEmailVerification)
router.post('/verify-email',loadOtpVerification)
router.post('/verify-otp',loadChangePassword)
router.post('/change-password',changePassword)


export default router
