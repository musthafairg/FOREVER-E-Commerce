import Product from "../../models/productModel.js";
import Category from "../../models/categoryModel.js";
import Brand from "../../models/brandModel.js";
import User from "../../models/userModel.js";
import fs from 'fs';
import { promisify } from 'util';
const unlinkAsync = promisify(fs.unlink);
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import sharp from "sharp";
import { error } from "console";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



export const getProductAddPage= async(req,res)=>{
    try {
        const category=await Category.find({isListed:true});
        const brand=await Brand.find({isBlocked:false});
        res.render("admin/add-product",{
            page:"addProducts",
            cat:category,
            brand:brand
        });
    } catch (error) {
        res.redirect("/admin/pageerror")
    }
}




// Assuming fs and path are imported at the top of the file
export const addProducts = async (req, res) => {
    // Array to store paths of original files for cleanup
    const originalFilePaths = req.files ? req.files.map(file => file.path) : [];

    try {
        const products = req.body;
        
        // 1. Check if product already exists
        const productExists = await Product.findOne({
            productName: products.productName,
        });

        if (!productExists) {
            const images = [];

            if (req.files && req.files.length > 0) {
    for (let i = 0; i < req.files.length; i++) {
        const filename = req.files[i].filename;
        const originalImagePath = req.files[i].path;
        

        // Ensure the 'product-images' directory exists before writing
        // This path should match your static configuration
        const updatedName = `${Date.now()}-${filename}`
        const resizedImagePath = path.join('public', 'uploads', 're-image', updatedName);
        
        // // Resize, save the resized image, and collect the filename
        await sharp(originalImagePath).toFile(resizedImagePath);
        images.push(updatedName);  // Frontend already cropped image
    }
}


            // 3. Find Category ID
            const categoryDoc = await Category.findOne({ name: products.category });
            
            if (!categoryDoc) {
                // Better error handling: redirect the user back with an error message
                return res.redirect("/admin/addProducts?error=Invalid+category+name");
            }

            // 4. Create and Save New Product
            const newProduct = new Product({
                productName: products.productName,
                description: products.descriptionData,
                brand: products.brand,
                category: categoryDoc._id, // Use the fetched ID
                regularPrice: products.regularPrice,
                salePrice: products.salePrice,
                createdAt: new Date(),
                quantity: products.quantity,
                color: products.color,
                productImage: images,
                status: "Available"
            });
            await newProduct.save();

            // 5. Success cleanup and redirect
            return res.redirect("/admin/addProducts");
        } else {
            // Product already exists
            return res.redirect("/admin/addProducts?error=Product+already+exists");
        }
    } catch (error) {
        console.error("Error saving product:", error);
        
        // 6. Error cleanup: If an error occurs, the temporary files must still be deleted
        // This is done in the finally block below.
        res.redirect("/admin/pageerror");
    } finally {
        // 7. CRITICAL STEP: Delete all original temporary files created by Multer
        for (const filePath of originalFilePaths) {
            try {
                // Use fs.unlink (or unlinkAsync if using promises)
                await unlinkAsync(filePath); 
            } catch (unlinkError) {
                console.error(`Failed to delete temporary file: ${filePath}`, unlinkError);
                // Log the error but continue execution
            }
        }
    }
}




export const getAllProducts=async(req,res)=>{
    try {
        const search=req.query.search||"";
        const page=req.query.page;
        const limit=4;

        const productData=await Product.find({
            $or:[
                {productName:{$regex:new RegExp(".*"+search+".*","i")}},
                {brand:{$regex:new RegExp(".*"+search+".*","i")}}
            ],

        })
        .limit(limit*1)
        .skip((page-1)*limit)
        .populate('category')
        .exec();

        const count= await Product.find({
            $or:[
                {productName:{$regex:new RegExp(".*"+search+".*","i")}},
                {brand:{$regex:new RegExp(".*"+search+".*","i")}}
            ],
        }).countDocuments();

        const category=await Category.find({isListed:true});
        const brand= await Brand.find({isBlocked:false});

        if(category && brand){
            res.render("admin/products",{
                page:'products',
                data:productData,
                currentPage:page,
                totalPages:Math.ceil(count/limit),
                cat:category,
                brand:brand
            })
        }else{
             res.redirect("/admin/pageerror")
        }
    }catch(error){
        res.redirect("/admin/pageerror")
    }
}


export const addProductOffer=async(req,res)=>{
    try {
        const {productId,percentage}=req.body;
        const findProduct=await Product.findOne({_id:productId});
        const findCategory=await Category.findOne({_id:findProduct.category})

        if(findCategory.categoryOffer>percentage){
            return res.json({status:false,message:"This products category aiready has a category offer"});

        }

        findProduct.salePrice=findProduct.salePrice.Math.floor(findProduct.regularPrice*(percentage/100))
        await findProduct.save();
        findCategory.categoryOffer=0;
        await findCategory.save();
        res.json({status:true})

    } catch (error) {
        
        res.redirect("/admin/pageerror")
        res.status(500).json({status:false,message:"Internal Server Error"})
    }
}


export const removeProductOffer= async (req,res)=>{
    try {
        const {productId}=req.body;
        const findProduct=await Product.findOne({_id:productId});
        const percentage= findProduct.productOffer;
        findProduct.salePrice=findProduct.salePrice+Math.floor(findProduct.regularPrice*(percentage/100));
        findProduct.productOffer=0;
        await findProduct.save();
        res.json({status:true});
    } catch (error) {
        res.redirect("pageerror")
    }
}


export const blockProduct=async(req,res)=>{
    try {
        let {id}=req.query;
        await Product.updateOne({_id:id},{$set:{isBlocked:true}})
        res.redirect("/admin/products")
    } catch (error) {
        res.redirect("/admin/pageerror");
    }
}


export const unblockProduct=async(req,res)=>{
    try {
        let {id}=req.query;
        await Product.updateOne({_id:id},{$set:{isBlocked:false}})
        res.redirect("/admin/products")
    } catch (error) {
        res.redirect("/admin/pageerror");
    }
}



export const  getEditProduct=async(req,res)=>{
    try {
        const {id}=req.query;
        const product=await Product.findOne({_id:id});
        const category=await Category.find({})
        const brand= await Brand.find({});
        res.render("admin/edit-product",{
            product:product,
            cat:category,
            brand:brand,
        })
    } catch (error) {
        res.redirect("/admin/pageerror")
    }
}


export const editProduct= async(req,res)=>{
    try {
        const id=req.params.id;
        const product=await Product.findOne({_id:id});
        const data= req.body;
        const existingProduct=await Product.findOne({
            productName:data.productName,
            _id:{$ne:id}
        })
        if(existingProduct){
            return res.status(400).json({error:"Product with this name already exists. please try with another name"})

        }

        const images=[];
        if(req.files&&req.files.length>0){
            for(let i=0;req.files.length;i++){
                images.push(req.filles[i].filename);
            }
        }
        const updatedFieldes ={
            productName:data.productName,
            description:data.description,
            brand:data.brand,
            category:product.category,
            regularPrice:data.regularPrice,
            salePrice:data.salePrice,
            quantity:data.quantity,
            size:data.size,
            color:data.color,
        }
        if(req.files.length>0){
            updatedFieldes.$push={productImage:{$each:images}};

        }
        await Product.findByIdAndUpdate("id,updateFieldes,{new:true}");

    } catch (error) {
        res.redirect("/admin/pageerror")
    }
}

export const deleteSingleImage=async(req,res)=>{
    try {
        const {imageNameToServer,productIdToServer}=req.body;
        const product= await Product.findByIdAndUpdate(productIdToServer,{$pull:{productImage:imagrNameToServer}});
        const imagePath=path.join("public","uploads","re-image","imageNameToServer");
        if(fs.existsSync(imagePath)){
            await fs.unlinkSync(imagePath);
            console.log(`image ${imageNameToServer} deleted succesfully`);
        }else{
            console.log(`image ${imageNameToServer} not found `)
        }
        res.send({status:true});
    } catch (error) {
        res.redirect("/admin/pageerror")
    }
}























// export const addProducts= async(req,res)=>{
//     try {
//         const products=req.body;
//         const productExists=await Product.findOne({
//             productName:products.productName,

//         });
//         if(!productExists){
//             const images=[];
//             if(req.files&&req.files.length>0){
//                 for(let i=0;i<req.files.length;i++){
//                     const originalImagePath=req.files[i].path;

//                     const resizedImagePath=path.join('public','uploads','product-images',req.files[i].filename);
//                     await sharp(originalImagePath).resize({width:440,height:440}).toFile(resizedImagePath);
//                     images.push(req.files[i].filename);
//                 }
//             }
//             const categoryId=await Category.findOne({name:products.category});
//             if(!categoryId){
//                 return res.status(400).json("invalid category name")
//             }
//             const newProduct=new Product({
//                 productName:products.productName,
//                 description:products.description,
//                 brand:products.brand,
//                 category:categoryId._id,
//                 regularPrice:products.regularPrice,
//                 salePrice:products.salePrice,
//                 createdAt:new Date(),
//                 quantity:products.quantity,
//                 size:products.size,
//                 color:products.color,
//                 productImage:images,
//                 status:"Available"
//             });
//             await newProduct.save();
//             return res.redirect("/admin/addProducts")
//         }else{
//             return res.status(400).json("Product already exist. please try again with another name")
//         }
//     } catch (error) {
        
//         console.error("Error saving product");
//         res.redirect("/admin/pageerror")
        
//     }
// }
