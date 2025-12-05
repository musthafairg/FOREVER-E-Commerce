

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

function applySorting(products, sortType) {
  switch (sortType) {
    case "priceLow":
      return products.sort((a, b) => a.salePrice - b.salePrice);

    case "priceHigh":
      return products.sort((a, b) => b.salePrice - a.salePrice);

    case "az":
      return products.sort((a, b) => a.productName.localeCompare(b.productName));

    case "za":
      return products.sort((a, b) => b.productName.localeCompare(a.productName));

    default:
      return products; // keep newest order
  }
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
    req.session.otpExpires = Date.now() + 60 * 1000; // valid for 60 seconds
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


export const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    // Check expiration
    if (Date.now() > req.session.otpExpires) {
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please resend OTP."
      });
    }

    // Check OTP value
    if (otp === req.session.userOtp) {

      const user = req.session.userData;
      const passwordHash = await securePassword(user.password);

      const saveUserData = new User({
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        password: passwordHash,
      });

      await saveUserData.save();
      req.session.user = saveUserData;

      // Clear OTP session
      req.session.userOtp = null;
      req.session.otpExpires = null;

      return res.json({ success: true, redirectUrl: "/login" });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid OTP. Please try again."
    });

  } catch (error) {
    console.error("Error verifying OTP", error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const userData = req.session.userData;

    if (!userData || !userData.email) {
      return res.status(400).json({
        success: false,
        message: "Session expired. Please signup again."
      });
    }

    const email = userData.email;

    const otp = generateOtp();
    req.session.userOtp = otp;
    req.session.otpExpires = Date.now() + 60 * 1000; // new 60s window for the new OTP

    const emailSent = await sendVerificationEmail(email, otp);

    if (emailSent) {
      console.log("Resend OTP:", otp);
      return res.status(200).json({
        success: true,
        message: "OTP resent successfully"
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Failed to resend OTP. Please try again"
      });
    }

  } catch (error) {
    console.error("Error resending OTP", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again"
    });
  }
};





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

    const user=req.session.user||req.user;
   // console.log("user",user);
    
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
//console.log("userData",userData);
      
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



export const loadShoppingPage = async (req, res) => {
  try {
    const user = req.session.user||req.user;
    const userData = await User.findById(user);

    const sort = req.query.sort || "";

    const categories = await Category.find({ isListed: true });
    const brands = await Brand.find({});

    const categoryIds = categories.map(cat => cat._id);

    let products = await Product.find({
      isBlocked: false,
      category: { $in: categoryIds },
      quantity: { $gt: 0 }
    })
    .lean();

    // Sort the products
    products = applySorting(products, sort);

    // Pagination
    const limit = 9;
    const page = parseInt(req.query.page) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedProducts = products.slice(startIndex, startIndex + limit);

    const totalPages = Math.ceil(products.length / limit);

  res.render("user/shop", {
  user: userData,
  products: paginatedProducts,
  category: categories,
  brand: brands,
  totalPages,
  currentPage: page,
  sort,
  search: "",

  selectedCategory: null,
  selectedBrand: null,
  selectedPrice: null
});

  } catch (error) {
    res.redirect("/pageNotFound");
  }



};export const filterProduct = async (req, res) => {
  try {
    const user = req.session.user || req.user;
    const categoryId = req.query.category;
    const brandName = req.query.brand;
    const sort = req.query.sort || "";

    const categories = await Category.find({ isListed: true }).lean();
    const brands = await Brand.find({}).lean();

    const filterQuery = {
      isBlocked: false,
      quantity: { $gt: 0 }
    };

    // Apply filters
    if (categoryId) filterQuery.category = categoryId;
    if (brandName) filterQuery.brand = brandName;

    let products = await Product.find(filterQuery).lean();

    // Sorting
    products = applySorting(products, sort);

    // Pagination
    const limit = 6;
    const page = parseInt(req.query.page) || 1;
    const startIndex = (page - 1) * limit;

    const paginatedProducts = products.slice(startIndex, startIndex + limit);
    const totalPages = Math.ceil(products.length / limit);

    res.render("user/shop", {
      user: user ? await User.findById(user._id).lean() : null, // FIXED
      products: paginatedProducts,
      category: categories,
      brand: brands,
      totalPages,
      currentPage: page,
      sort,
      search: "",
      selectedCategory: categoryId || null, // for highlight
      selectedBrand: brandName || null      // for highlight
    });

  } catch (error) {
    console.error(error);
    res.redirect("/pageNotFound");
  }
};

export const filterByPrice = async (req, res) => {
  try {
    const user = req.session.user || req.user;
    const gt = Number(req.query.gt);
    const lt = Number(req.query.lt);
    const sort = req.query.sort || "";

    const categories = await Category.find({ isListed: true }).lean();
    const brands = await Brand.find({}).lean();

    let products = await Product.find({
      salePrice: { $gt: gt, $lt: lt },
      isBlocked: false,
      quantity: { $gt: 0 }
    }).lean();

    // Sorting
    products = applySorting(products, sort);

    // Pagination
    const limit = 6;
    const page = parseInt(req.query.page) || 1;
    const paginatedProducts = products.slice((page - 1) * limit, page * limit);

    const totalPages = Math.ceil(products.length / limit);

    res.render("user/shop", {
      user: user ? await User.findById(user._id).lean() : null,
      products: paginatedProducts,
      category: categories,
      brand: brands,
      totalPages,
      currentPage: page,
      sort,
      search: "",

      // ADD THESE THREE LINES
      selectedCategory: null,
      selectedBrand: null,
      selectedPrice: { gt, lt } // (Optional: if you want to highlight price buttons)
    });

  } catch (error) {
    console.error(error);
    res.redirect("/pageNotFound");
  }
};



export const searchProducts = async (req, res) => {
  try {
    const user = req.session.user||req.user;
    const userData = await User.findById(user);

    const brands = await Brand.find({});
    const categories = await Category.find({ isListed: true });
    const categoryIds = categories.map(c => c._id);

    const sort = req.query.sort || "";
    const search = req.body.query?.trim() || "";

    let searchResult = await Product.find({
      productName: { $regex: search, $options: "i" },
      isBlocked: false,
      quantity: { $gt: 0 },
      category: { $in: categoryIds }
    }).lean();

    // Sorting
    searchResult = applySorting(searchResult, sort);

    // Pagination
    const limit = 6;
    const page = parseInt(req.query.page) || 1;
    const startIndex = (page - 1) * limit;

    const paginatedProducts = searchResult.slice(startIndex, startIndex + limit);
    const totalPages = Math.ceil(searchResult.length / limit);

    res.render("user/shop", {
      user: userData,
      products: paginatedProducts,
      category: categories,
      brand: brands,
      currentPage: page,
      totalPages,
      sort,
      search, // keep search text in input
      count: searchResult.length
    });

  } catch (error) {
    res.redirect("/pageNotFound");
  }
};

export const getContactPage=async(req,res)=>{
  try {
    const user = req.session.user||req.user;
    const userData = await User.findById(user);

  res.render("user/contact",{
    user:userData
  })
  } catch (error) {
    res,redirect("/pageNotFound")
  }
}



// ================= DEMO LOGIN =================
export const demoLogin = async (req, res) => {
    try {
        const demoEmail = "demo@yourshop.com"; // create this user in DB
        const demoUser = await User.findOne({ email: demoEmail });

        if (!demoUser) {
            return res.send("Demo user not found. Please create a demo user in DB.");
        }

        req.session.user = {
            _id: demoUser._id,
            name: demoUser.name,
            email: demoUser.email
        };

        return res.redirect("/");

    } catch (error) {
        console.error("Error in demo login:", error);
        return res.redirect("/pageNotFound");
    }
};