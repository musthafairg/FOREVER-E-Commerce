import express from 'express' 
const router=express.Router()
import {filterByPrice,searchProducts,filterProduct,logout,loadSignup,signupUser,loadLogin,verifyOtp,resendOtp,loadPageNotFound,login,loadHomepage,loadShoppingPage,getContactPage} from '../controller/user/userController.js'
import passport from '../config/passport.js'
import {getForgotPasswordPage,forgotEmailValid,verifyOtpPass,getRestPassPage,resendOtpPass,postNewPassword,userProfile}from '../controller/user/profileController.js'
import {userAuth} from '../middleware/auth.js'
import {productDetailes,addReview,addToCart,demoLogin}from '../controller/user/productController.js'

//signup Management
router.get('/signUp',loadSignup)
router.post('/signUp',signupUser)
router.post("/verify-otp",verifyOtp)
router.post("/resend-otp",resendOtp)
 router.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}))
router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/signup'}),
(req,res)=>{
    req.session.user=req.user;
    res.redirect('/')
})

//Login Management
router.get('/login',loadLogin)
router.post('/login',login)
router.get('/logout',logout)

//Home Page & Shopping page
router.get('/',userAuth, loadHomepage)
router.get("/shop",userAuth, loadShoppingPage);
router.get("/filter",userAuth,filterProduct);
router.get("/filterPrice",userAuth,filterByPrice)
router.post("/search",userAuth,searchProducts)
router.get("/clear-search", (req, res) => {
  delete req.session.filteredProducts;
  res.redirect("/shop");
});

router.get("/contact",getContactPage)


//Product Management
router.get("/productDetails",userAuth,productDetailes)

// ADD REVIEW
router.post("/product/add-review", addReview);

// ADD TO CART (AJAX)
router.post("/add-to-cart", addToCart);

// DEMO LOGIN
router.get("/demo-login", demoLogin);

//Profile Management
router.get("/forgot-password",getForgotPasswordPage)
router.post("/forgot-email-valid",forgotEmailValid)
router.post("/verify-otp-pass",verifyOtpPass)
router.post("/resend-otp-pass",resendOtpPass)
router.get("/reset-password",getRestPassPage)
router.post("/reset-password",postNewPassword)
router.get("/userProfile",userAuth,userProfile)


//Error Management
router.get("/pageNotFound",loadPageNotFound)


export default router
