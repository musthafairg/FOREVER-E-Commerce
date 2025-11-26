import Product from "../../models/productModel.js";
import Category from "../../models/categoryModel.js";
import User from "../../models/userModel.js";


export const  productDetailes=async(req,res)=>{
    try {
        const userId=req.session.user;
        const userData=await User.findById(userId);
        const productId=req.query.id;
        const product=await Product.findById(productId).populate('category');
        const findCategory= product.category;
        const categoryOffer= findCategory?.categoryOffer||0;
        const productOffer=product.productOffer||0;
        const totalOffer=categoryOffer+productOffer;
        res.render("user/product-details",{
            user:userData,
            product:product,
            quantity:product.quantity,
            totalOffer:totalOffer,
            category:findCategory,
        
        })
    } catch (error) {
        
        console.error("Error for fetching product details");
        res.redirect("/pageNotFound")
    }
}