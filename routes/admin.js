import express from 'express' 
const router=express.Router()
import {loadLogin,login,loadDashboard,pageerror,logout} from '../controller/admin/adminController.js'
import {userAuth,adminAuth} from '../middleware/auth.js'
import{customerInfo,customerBlocked,customerunBlocked} from '../controller/admin/customerController.js'
import {categoryInfo,addCategory,addCategoryOffer,removeCategoryOffer,getListCategory,getUnlistCategory,editCategory,getEditCategory}from '../controller/admin/categoryController.js'
import{getBrandPage,addBrand,blockBrand,unBlockBrand,deleteBrand}from '../controller/admin/brandController.js'
import{getProductAddPage,addProducts,getAllProducts,addProductOffer,removeProductOffer,blockProduct,unblockProduct,getEditProduct,editProduct,deleteSingleImage}from '../controller/admin/productController.js'

import multer from 'multer';
import{storage}from '../helpers/multer.js'

const uploads=multer({storage:storage})

//Error Management
router.get("/pageerror",pageerror)

//Login Management
router.get('/login',loadLogin)
router.post('/login',login)
router.get("/",adminAuth,loadDashboard)
router.get('/logout',logout)

//Customer Mangement
router.get("/users",adminAuth,customerInfo)
router.get("/blockCustomer",adminAuth,customerBlocked)
router.get("/unblockCustomer",adminAuth,customerunBlocked)


//Category Management
router.get("/category",adminAuth,categoryInfo)
router.post("/addCategory",adminAuth,addCategory)
router.post("/addCategoryOffer",adminAuth,addCategoryOffer)
router.post("/removeCategoryOffer",adminAuth,removeCategoryOffer)
router.get("/listCategory",adminAuth,getListCategory)
router.get("/unlistCategory",adminAuth,getUnlistCategory)
router.get("/editCategory",adminAuth,getEditCategory)
router.post("/editCategory/:id",adminAuth,editCategory)

//Brand Management
router.get("/brands",adminAuth,getBrandPage)
router.post("/addBrand",adminAuth,uploads.single("image"),addBrand)
router.get("/blockBrand",adminAuth,blockBrand);
router.get("/unBlockBrand",adminAuth,unBlockBrand);
router.get("/deleteBrand",adminAuth,deleteBrand);

//Product Management
router.get("/addProducts",adminAuth,getProductAddPage);
router.post("/addProducts",adminAuth,uploads.array("images",4),addProducts)
router.get("/products",adminAuth,getAllProducts);
router.post("/addProductOffer",adminAuth,addProductOffer)
router.post("/removeProductOffer",adminAuth,removeProductOffer)
router.get("/blockProduct",adminAuth,blockProduct);
router.get("/unblockProduct",adminAuth,unblockProduct);
router.get("/editProduct",adminAuth,getEditProduct)
router.post("/editProduct/:id",adminAuth,uploads.array("images",4),editProduct)
router.post("/deleteImage",adminAuth,deleteSingleImage);

export default router
