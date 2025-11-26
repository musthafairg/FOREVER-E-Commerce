

import 'dotenv/config'
import nodemailer from 'nodemailer'
import User from "../../models/userModel.js"
import bcrypt from 'bcrypt'
import Product from '../../models/productModel.js'
import Category from '../../models/categoryModel.js'
import Brand from '../../models/brandModel.js'

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
    res.redirect("pageNotFound")
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
      req.session.user=saveUserData._id;
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
    console.log("user",user);
    
    const categories=await Category.find({isListed:true});
    let productData=await Product.find({
      isBlocked:false,
      category:{$in:categories.map(category=>category._id)},
      quantity:{$gt:0}
    })

    productData.sort((a,b)=> new Date(b.createdAt)- new Date(a.createdAt));
    productData=productData;

    if(user){
      const userData=await User.findOne({_id:user._id});
      console.log("userData",userData);
      
      res.render("user/index",{user:userData,products:productData})
    }else{
       return res.render("user/index",{products:productData});
    }
   
  } catch (error) {
    console.error("Home page not loading");

    res.redirect("/pageNotFound")
      
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
    
    res.redirect("/pageNotFound")
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

  console.log(findUser.id);
  
  req.session.user=findUser;
  console.log(req.session.user.name);
  
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
    res.redirect("/pageNotFound")
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


export const loadShoppingPage=async(req,res)=>{
  try {
    const user=req.session.user;
    const userData=await User.findOne({_id:user});
    const categories= await Category.find({isListed:true});
    const categoryIds=categories.map((category)=>category._id.toString());
    const page=parseInt(req.query.page)||1;
    const limit=9;
    const skip=(page-1)*limit;
    const products=await Product.find({
      isBlocked:false,
      category:{$in:categoryIds},
      quantity:{$gt:0},
    }).sort({createdAt:-1}).skip(skip).limit(limit);

    const totalProducts=await Product.countDocuments({
      isBlocked:false,
      category:{$in:categoryIds},
      quantity:{$gt:0}
    });
    const totalPages=Math.ceil(totalProducts/limit);
    const brands= await Brand.find({isBlocked:false});
    const categoriesWithIds=categories.map(category=>({_id:category._id,name:category.name}));



    res.render("user/shop",{
      user:userData,
      products:products,
      category:categoriesWithIds,
      brand:brands,
      totalProducts:totalProducts,
      currentPage:page,
      totalPages:totalPages,

    })
  } catch (error) {
    res.redirect("/pageNotFound")
  }
}

export const filterProduct = async (req, res) => {
  try {
    const user = req.session.user;
    const category = req.query.category;
    const brand = req.query.brand;

    // Correct category lookup
    const findCategory = category ? await Category.findOne({ _id: category }) : null;

    // Correct brand lookup
    const findBrand = brand ? await Brand.findOne({ _id: brand }) : null;

    const categories = await Category.find({ isListed: true }).lean();
    const brands = await Brand.find({}).lean();

    const query = {
      isBlocked: false,
      quantity: { $gt: 0 }
    };

    if (findCategory) {
      query.category = findCategory._id;
    }

    if (findBrand) {
      query.brand = findBrand.brandName;
    }

    let findProducts = await Product.find(query).lean();
    findProducts = findProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    let itemsPerPage = 6;
    let currentPage = parseInt(req.query.page) || 1;
    let startIndex = (currentPage - 1) * itemsPerPage;
    let endIndex = startIndex + itemsPerPage;
    let totalPages = Math.ceil(findProducts.length / itemsPerPage);
    const currentProduct = findProducts.slice(startIndex, endIndex);

    // Save user search history
    let userData = null;
    if (user) {
      userData = await User.findOne({ _id: user });
      if (userData) {
        const searchEntry = {
          category: findCategory ? findCategory._id : null,
          brand: findBrand ? findBrand.brandName : null,
          searchedOn: new Date()
        };
        userData.searchHistory.push(searchEntry);
        await userData.save();
      }
    }

    res.render("user/shop", {
      user: userData,
      products: currentProduct,
      category: categories,
      brand: brands,
      totalPages,
      currentPage,
      selectedCategory: category || null,
      selectedBrand: brand || null,
    });

  } catch (error) {
    console.log(error);
    res.redirect("/pageNotFound");
  }
};

export const filterByPrice = async (req, res) => {
  try {
    const user = req.session.user;
    const categories = await Category.find({ isListed: true }).lean();
    const brands = await Brand.find({}).lean();
    const userData = user ? await User.findOne({ _id: user }) : null;

    const gt = Number(req.query.gt);
    const lt = Number(req.query.lt);

    let findProducts = await Product.find({
      salePrice: { $gt: gt, $lt: lt },
      isBlocked: false,
      quantity: { $gt: 0 }
    }).lean();

    findProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    let itemsPerPage = 6;
    let currentPage = parseInt(req.query.page) || 1;
    let startIndex = (currentPage - 1) * itemsPerPage;
    let endIndex = startIndex + itemsPerPage;
    let totalPages = Math.ceil(findProducts.length / itemsPerPage);
    const currentProduct = findProducts.slice(startIndex, endIndex);

    res.render("user/shop", {
      user: userData,
      products: currentProduct,
      category: categories,
      brand: brands,
      totalPages,
      currentPage
    });

  } catch (error) {
    console.error(error);
    res.redirect("/pageNotFound");
  }
};


export const searchProducts=async(req,res)=>{

  try {
    const user=req.session.user;
    const userData=await User.findOne({_id:user});
    let search=req.body.query;

    const brands=await Brand.find({}).lean();
    const categories=await Category.find({isListed:true}).lean();
    const categoryIds=categories.map(category=>category._id.toString());
    let  searchResult=[];

    if(req.session.filteredProducts&&req.session.filteredProducts.length>0){
      searchResult=req.session.filteredProducts.filter(product=>{
        product.productName.toLowerCase().includes(search.toLowerCase())
      })
    }else{
      searchResult=await Product.find({
        productName:{$regex:".*"+search+".*",$options:"i"},
        isBlocked:false,
        quantity:{$gt:0},
        category:{$in:categoryIds},
      })
    }

    searchResult.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    let itemsPerPage=6;
    let currentPage=parseInt(req.query.page)||1;
    let startIndex=(currentPage-1)*itemsPerPage;
    let endIndex=startIndex+itemsPerPage;
    let totalPages=Math.ceil(searchResult.length/itemsPerPage);
    const currentProduct=searchResult.slice(startIndex,endIndex);
    
    res.render("user/shop",{
      user:userData,
      products:currentProduct,
      category:categories,
      brand:brands,
      totalPages,
      currentPage,count:searchResult.length,
    })

  } catch (error) {
    console.error("Error",error);

    res.redirect("/pageNotFound")
  }
}