// import Product from "../../models/productModel.js";
// import Category from "../../models/categoryModel.js";
// import Brand from "../../models/brandModel.js";
// import User from "../../models/userModel.js";
// import fs from 'fs';
// import { promisify } from 'util';
// const unlinkAsync = promisify(fs.unlink);
// import path from 'path';
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// import sharp from "sharp";
// import { error } from "console";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);



// export const getProductAddPage= async(req,res)=>{
//     try {
//         const category=await Category.find({isListed:true});
//         const brand=await Brand.find({isBlocked:false});
//         res.render("admin/add-product",{
//             page:"addProducts",
//             cat:category,
//             brand:brand
//         });
//     } catch (error) {
//         res.redirect("/admin/pageerror")
//     }
// }





// export const addProducts = async (req, res) => {
//     // Array to store paths of original files for cleanup
//     const originalFilePaths = req.files ? req.files.map(file => file.path) : [];

//     try {
//         const products = req.body;
        
//         // 1. Check if product already exists
//         const productExists = await Product.findOne({
//             productName: products.productName,
//         });

//         if (!productExists) {
//             const images = [];

//             if (req.files && req.files.length > 0) {
//     for (let i = 0; i < req.files.length; i++) {
//         const filename = req.files[i].filename;
//         const originalImagePath = req.files[i].path;
        

//         // Ensure the 'product-images' directory exists before writing
//         // This path should match your static configuration
//         const updatedName = `${Date.now()}-${filename}`
//         const resizedImagePath = path.join('public', 'uploads', 're-image', updatedName);
        
//         // // Resize, save the resized image, and collect the filename
//         await sharp(originalImagePath).toFile(resizedImagePath);
//         images.push(updatedName);  // Frontend already cropped image
//     }
// }


//             // 3. Find Category ID
//             const categoryDoc = await Category.findOne({ name: products.category });
            
//             if (!categoryDoc) {
//                 // Better error handling: redirect the user back with an error message
//                 return res.redirect("/admin/addProducts?error=Invalid+category+name");
//             }

//             // 4. Create and Save New Product
//             const newProduct = new Product({
//                 productName: products.productName,
//                 description: products.descriptionData,
//                 brand: products.brand,
//                 category: categoryDoc._id, // Use the fetched ID
//                 regularPrice: products.regularPrice,
//                 salePrice: products.salePrice,
//                 createdAt: new Date(),
//                 quantity: products.quantity,
//                 color: products.color,
//                 productImage: images,
//                 status: "Available"
//             });
//             await newProduct.save();

//             // 5. Success cleanup and redirect
//             return res.redirect("/admin/addProducts");
//         } else {
//             // Product already exists
//             return res.redirect("/admin/addProducts?error=Product+already+exists");
//         }
//     } catch (error) {
//         console.error("Error saving product:", error);
        
//         // 6. Error cleanup: If an error occurs, the temporary files must still be deleted
//         // This is done in the finally block below.
//         res.redirect("/admin/pageerror");
//     } finally {
//         // 7. CRITICAL STEP: Delete all original temporary files created by Multer
//         for (const filePath of originalFilePaths) {
//             try {
//                 // Use fs.unlink (or unlinkAsync if using promises)
//                 await unlinkAsync(filePath); 
//             } catch (unlinkError) {
//                 console.error(`Failed to delete temporary file: ${filePath}`, unlinkError);
//                 // Log the error but continue execution
//             }
//         }
//     }
// }




// export const getAllProducts=async(req,res)=>{
//     try {
//         const search=req.query.search||"";
//         const page=req.query.page;
//         const limit=4;

//         const productData=await Product.find({
//             $or:[
//                 {productName:{$regex:new RegExp(".*"+search+".*","i")}},
//                 {brand:{$regex:new RegExp(".*"+search+".*","i")}}
//             ],

//         })
//         .limit(limit*1)
//         .skip((page-1)*limit)
//         .populate('category')
//         .exec();

//         const count= await Product.find({
//             $or:[
//                 {productName:{$regex:new RegExp(".*"+search+".*","i")}},
//                 {brand:{$regex:new RegExp(".*"+search+".*","i")}}
//             ],
//         }).countDocuments();

//         const category=await Category.find({isListed:true});
//         const brand= await Brand.find({isBlocked:false});

//         if(category && brand){
//             res.render("admin/products",{
//                 page:'products',
//                 data:productData,
//                 currentPage:page,
//                 totalPages:Math.ceil(count/limit),
//                 cat:category,
//                 brand:brand
//             })
//         }else{
//              res.redirect("/admin/pageerror")
//         }
//     }catch(error){
//         res.redirect("/admin/pageerror")
//     }
// }


// export const addProductOffer=async(req,res)=>{
//     try {
//         const {productId,percentage}=req.body;
//         const findProduct=await Product.findOne({_id:productId});
//         const findCategory=await Category.findOne({_id:findProduct.category})

//         if(findCategory.categoryOffer>percentage){
//             return res.json({status:false,message:"This products category aiready has a category offer"});

//         }

//         findProduct.salePrice=findProduct.salePrice.Math.floor(findProduct.regularPrice*(percentage/100))
//         await findProduct.save();
//         findCategory.categoryOffer=0;
//         await findCategory.save();
//         res.json({status:true})

//     } catch (error) {
        
//         res.redirect("/admin/pageerror")
//         res.status(500).json({status:false,message:"Internal Server Error"})
//     }
// }


// export const removeProductOffer= async (req,res)=>{
//     try {
//         const {productId}=req.body;
//         const findProduct=await Product.findOne({_id:productId});
//         const percentage= findProduct.productOffer;
//         findProduct.salePrice=findProduct.salePrice+Math.floor(findProduct.regularPrice*(percentage/100));
//         findProduct.productOffer=0;
//         await findProduct.save();
//         res.json({status:true});
//     } catch (error) {
//         res.redirect("pageerror")
//     }
// }


// export const blockProduct=async(req,res)=>{
//     try {
//         let {id}=req.query;
//         await Product.updateOne({_id:id},{$set:{isBlocked:true}})
//         res.redirect("/admin/products")
//     } catch (error) {
//         res.redirect("/admin/pageerror");
//     }
// }


// export const unblockProduct=async(req,res)=>{
//     try {
//         let {id}=req.query;
//         await Product.updateOne({_id:id},{$set:{isBlocked:false}})
//         res.redirect("/admin/products")
//     } catch (error) {
//         res.redirect("/admin/pageerror");
//     }
// }



// export const  getEditProduct=async(req,res)=>{
//     try {
//         const {id}=req.query;
//         const product=await Product.findOne({_id:id});
//         const category=await Category.find({})
//         const brand= await Brand.find({});
//         res.render("admin/edit-product",{
//             product:product,
//             cat:category,
//             brand:brand,
//         })
//     } catch (error) {
//         res.redirect("/admin/pageerror")
//     }
// }


// export const editProduct= async(req,res)=>{
//     try {
//         const id=req.params.id;
//         const product=await Product.findOne({_id:id});
//         const data= req.body;
//         const existingProduct=await Product.findOne({
//             productName:data.productName,
//             _id:{$ne:id}
//         })
//         if(existingProduct){
//             return res.status(400).json({error:"Product with this name already exists. please try with another name"})

//         }

//         const images=[];
//         if(req.files&&req.files.length>0){
//             for(let i=0;req.files.length;i++){
//                 images.push(req.filles[i].filename);
//             }
//         }
//         const updatedFieldes ={
//             productName:data.productName,
//             description:data.description,
//             brand:data.brand,
//             category:product.category,
//             regularPrice:data.regularPrice,
//             salePrice:data.salePrice,
//             quantity:data.quantity,
//             size:data.size,
//             color:data.color,
//         }
//         if(req.files.length>0){
//             updatedFieldes.$push={productImage:{$each:images}};

//         }
//         await Product.findByIdAndUpdate("id,updateFieldes,{new:true}");

//     } catch (error) {
//         res.redirect("/admin/pageerror")
//     }
// }

// export const deleteSingleImage = async (req, res) => {
//     try {
//         const { imageNameToServer, productIdToServer } = req.body;

//         if (!imageNameToServer || !productIdToServer) {
//             return res.json({ status: false, message: "Invalid request" });
//         }

//         // REMOVE IMAGE FROM ARRAY
//         await Product.findByIdAndUpdate(
//             productIdToServer,
//             { $pull: { productImage: imageNameToServer } }
//         );

//         // DELETE IMAGE FILE FROM SERVER
//         const imagePath = path.join("public", "uploads", "re-image", imageNameToServer);

//         if (fs.existsSync(imagePath)) {
//             fs.unlinkSync(imagePath);
//             console.log("Deleted image:", imageNameToServer);
//         } else {
//             console.log("Image not found:", imagePath);
//         }

//         return res.json({ status: true });

//     } catch (error) {
//         console.error("Error deleting single image:", error);
//         return res.json({ status: false, message: "Server error" });
//     }
// };























import Product from "../../models/productModel.js";
import Category from "../../models/categoryModel.js";
import Brand from "../../models/brandModel.js";
import User from "../../models/userModel.js";
import fs from "fs";
import { promisify } from "util";
const unlinkAsync = promisify(fs.unlink);
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================== ADD PRODUCT PAGE ====================
export const getProductAddPage = async (req, res) => {
  try {
    const category = await Category.find({ isListed: true });
    const brand = await Brand.find({ isBlocked: false });
    res.render("admin/add-product", {
      page: "addProducts",
      cat: category,
      brand: brand,
    });
  } catch (error) {
    console.error("Error loading add product page:", error);
    res.redirect("/admin/pageerror");
  }
};

// ==================== ADD PRODUCT ====================
export const addProducts = async (req, res) => {
  const originalFilePaths = req.files ? req.files.map((file) => file.path) : [];

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

          const updatedName = `${Date.now()}-${filename}`;
          const resizedImagePath = path.join(
            "public",
            "uploads",
            "re-image",
            updatedName
          );

          await sharp(originalImagePath).toFile(resizedImagePath);
          images.push(updatedName);
        }
      }

      // 3. Find Category ID
      const categoryDoc = await Category.findOne({ name: products.category });

      if (!categoryDoc) {
        return res.redirect("/admin/addProducts?error=Invalid+category+name");
      }

      // 4. Create and Save New Product
      const newProduct = new Product({
        productName: products.productName,
        description: products.descriptionData,
        brand: products.brand,
        category: categoryDoc._id,
        regularPrice: products.regularPrice,
        salePrice: products.salePrice,
        createdAt: new Date(),
        quantity: products.quantity,
        color: products.color,
        productImage: images,
        status: "Available",
      });
      await newProduct.save();

      return res.redirect("/admin/addProducts");
    } else {
      return res.redirect("/admin/addProducts?error=Product+already+exists");
    }
  } catch (error) {
    console.error("Error saving product:", error);
    res.redirect("/admin/pageerror");
  } finally {
    for (const filePath of originalFilePaths) {
      try {
        await unlinkAsync(filePath);
      } catch (unlinkError) {
        console.error(`Failed to delete temporary file: ${filePath}`, unlinkError);
      }
    }
  }
};

// ==================== LIST PRODUCTS ====================
export const getAllProducts = async (req, res) => {
  try {
    const search = req.query.search || "";
    const page = parseInt(req.query.page || "1", 10);
    const limit = 4;

    const query = {
      $or: [
        { productName: { $regex: new RegExp(".*" + search + ".*", "i") } },
        { brand: { $regex: new RegExp(".*" + search + ".*", "i") } },
      ],
    };

    const productData = await Product.find(query)
      .limit(limit)
      .skip((page - 1) * limit)
      .populate("category")
      .exec();

    const count = await Product.countDocuments(query);

    const category = await Category.find({ isListed: true });
    const brand = await Brand.find({ isBlocked: false });

    if (category && brand) {
      res.render("admin/products", {
        page: "products",
        data: productData,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        cat: category,
        brand: brand,
      });
    } else {
      res.redirect("/admin/pageerror");
    }
  } catch (error) {
    console.error("Error getting all products:", error);
    res.redirect("/admin/pageerror");
  }
};

// ==================== PRODUCT OFFER ====================
export const addProductOffer = async (req, res) => {
  try {
    const { productId, percentage } = req.body;
    const findProduct = await Product.findById(productId);

    if (!findProduct) {
      return res
        .status(404)
        .json({ status: false, message: "Product not found" });
    }

    const findCategory = await Category.findById(findProduct.category);

    if (findCategory && findCategory.categoryOffer > percentage) {
      return res.json({
        status: false,
        message: "This product's category already has a higher category offer",
      });
    }

    const offerPercentage = Number(percentage) || 0;

    findProduct.productOffer = offerPercentage;
    findProduct.salePrice =
      findProduct.regularPrice -
      Math.floor((findProduct.regularPrice * offerPercentage) / 100);

    await findProduct.save();

    if (findCategory) {
      findCategory.categoryOffer = 0;
      await findCategory.save();
    }

    res.json({ status: true });
  } catch (error) {
    console.error("Error adding product offer:", error);
    res
      .status(500)
      .json({ status: false, message: "Internal Server Error" });
  }
};

export const removeProductOffer = async (req, res) => {
  try {
    const { productId } = req.body;
    const findProduct = await Product.findById(productId);

    if (!findProduct) {
      return res
        .status(404)
        .json({ status: false, message: "Product not found" });
    }

    const percentage = findProduct.productOffer || 0;

    findProduct.salePrice =
      findProduct.salePrice +
      Math.floor((findProduct.regularPrice * percentage) / 100);
    findProduct.productOffer = 0;

    await findProduct.save();

    res.json({ status: true });
  } catch (error) {
    console.error("Error removing product offer:", error);
    res
      .status(500)
      .json({ status: false, message: "Internal Server Error" });
  }
};

// ==================== BLOCK / UNBLOCK ====================
export const blockProduct = async (req, res) => {
  try {
    const { id } = req.query;
    await Product.updateOne({ _id: id }, { $set: { isBlocked: true } });
    res.redirect("/admin/products");
  } catch (error) {
    console.error("Error blocking product:", error);
    res.redirect("/admin/pageerror");
  }
};

export const unblockProduct = async (req, res) => {
  try {
    const { id } = req.query;
    await Product.updateOne({ _id: id }, { $set: { isBlocked: false } });
    res.redirect("/admin/products");
  } catch (error) {
    console.error("Error unblocking product:", error);
    res.redirect("/admin/pageerror");
  }
};

// ==================== EDIT PRODUCT PAGE ====================
export const getEditProduct = async (req, res) => {
  try {
    const { id } = req.query;
    const product = await Product.findById(id);
    const category = await Category.find({});
    const brand = await Brand.find({});
    res.render("admin/edit-product", {
      page: "products",
      product,
      cat: category,
      brand: brand,
    });
  } catch (error) {
    console.error("Error loading edit product page:", error);
    res.redirect("/admin/pageerror");
  }
};

// ==================== UPDATE PRODUCT ====================
export const editProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id);

    if (!product) {
      return res.redirect("/admin/products?error=Product+not+found");
    }

    const data = req.body;

    const existingProduct = await Product.findOne({
      productName: data.productName,
      _id: { $ne: id },
    });

    if (existingProduct) {
      return res
        .status(400)
        .json({
          error:
            "Product with this name already exists. please try with another name",
        });
    }

    const newImages = [];

    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const filename = req.files[i].filename;
        const originalImagePath = req.files[i].path;

        const updatedName = `${Date.now()}-${filename}`;
        const resizedImagePath = path.join(
          "public",
          "uploads",
          "re-image",
          updatedName
        );

        await sharp(originalImagePath).toFile(resizedImagePath);
        newImages.push(updatedName);

        // remove original temp file
        await unlinkAsync(originalImagePath);
      }
    }

    const updateDoc = {
  productName: data.productName,
  description: data.descriptionData,
  brand: data.brand,
  regularPrice: data.regularPrice,
  salePrice: data.salePrice,
  quantity: data.quantity,
  color: data.color
};

// category must be ObjectId
if (data.category) {
  updateDoc.category = data.category;
}


    // if new images, push to current array
    if (newImages.length > 0) {
      await Product.findByIdAndUpdate(
        id,
        {
          $set: updateDoc,
          $push: { productImage: { $each: newImages } },
        },
        { new: true }
      );
    } else {
      await Product.findByIdAndUpdate(id, { $set: updateDoc }, { new: true });
    }

    return res.redirect("/admin/products");
  } catch (error) {
    console.error("Error updating product:", error);
    res.redirect("/admin/pageerror");
  }
};

// ==================== DELETE SINGLE IMAGE ====================
export const deleteSingleImage = async (req, res) => {
  try {
    const { imageNameToServer, productIdToServer } = req.body;

    console.log("deleteSingleImage body:", req.body);

    if (!imageNameToServer || !productIdToServer) {
      return res.json({ status: false, message: "Invalid request" });
    }

    // 1. Remove image name from productImage array
    await Product.findByIdAndUpdate(productIdToServer, {
      $pull: { productImage: imageNameToServer },
    });

    // 2. Delete physical file
    const imagePath = path.join(
      "public",
      "uploads",
      "re-image",
      imageNameToServer
    );

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      console.log("Deleted image file:", imagePath);
    } else {
      console.log("Image file not found:", imagePath);
    }

    return res.json({ status: true });
  } catch (error) {
    console.error("Error deleting single image:", error);
    return res.json({ status: false, message: "Server error" });
  }
};
