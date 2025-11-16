import express from 'express' 
const router=express.Router()
import {loadLogin,login,loadDashboard,pageerror,logout} from '../controller/admin/adminController.js'
import {userAuth,adminAuth} from '../middleware/auth.js'
import{customerInfo,customerBlocked,customerunBlocked} from '../controller/admin/customerController.js'

router.get("/pageerror",pageerror)
router.get('/login',loadLogin)


router.post('/login',login)
router.get("/",adminAuth,loadDashboard)
router.get('/logout',logout)

router.get("/users",adminAuth,customerInfo)
router.get("/blockCustomer",adminAuth,customerBlocked)
router.get("/unblockCustomer",adminAuth,customerunBlocked)

export default router
