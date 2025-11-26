import Brand from "../../models/brandModel.js"
// Import Product if you need it later, but it's not used here.
// import Product from "../../models/productModel.js" 

export const getBrandPage = async (req, res) => {
    try {
        // --- 1. Define Pagination Parameters ---
        const page = parseInt(req.query.page) || 1;
        const limit = 4;
        const skip = (page - 1) * limit;

        // --- 2. Fetch Data (The Correct Way) ---
        // Chain Mongoose methods for efficient database-level operations:
        const brandData = await Brand.find({})
            // Mongoose's .sort() method performs the sorting in the database
            .sort({ createdAt: -1 }) 
            // Mongoose's .skip() method skips documents in the database
            .skip(skip) 
            // Mongoose's .limit() method limits the number of documents returned
            .limit(limit);

        // --- 3. Calculate Total Pages ---
        const totalBrands = await Brand.countDocuments();
        const totalPages = Math.ceil(totalBrands / limit);
        
        // --- 4. Render Response (No need for .reverse() if sorting is correct) ---
        // Note: .reverse() is unnecessary if you sorted correctly (newest first).
        // If you still need the oldest first, use .sort({ createdAt: 1 }) instead.

        res.render("admin/brands", {
            page:"brands",
            data: brandData, // This array already contains the correct page data, sorted newest first
            currentPage: page,
            totalPages: totalPages, // Fixed redundant key: totalPages,totalPages
            totalBrands: totalBrands
        });
        
    } catch (error) {
        console.error("Error fetching brand page:", error); // It's good practice to log the error
        res.redirect("/admin/pageerror");
    }
};



export const addBrand= async(req,res)=>{
    try {
        const brand=req.body.name;
        const findBrand=await Brand.findOne({brand});
        if(!findBrand){
            const image=req.file.filename;
            const newBrand= new Brand({
                brandName:brand,
                brandImage:image,
            })
            await newBrand.save();
            res.redirect("/admin/brands");

        }
    } catch (error) {
        res.redirect("/admin/pageerror");
    }
}


export const blockBrand=async(req,res)=>{
    try {
        const {id}=req.query;
        await Brand.updateOne({_id:id},{$set:{isBlocked:true}});
        res.redirect("/admin/brands");
    } catch (error) {
        res.redirect("/admin/pageerror")
    }
}


export const unBlockBrand=async(req,res)=>{
    try {
        const {id}=req.query;
        await Brand.updateOne({_id:id},{$set:{isBlocked:false}});
        res.redirect("/admin/brands");
    } catch (error) {
        res.redirect("/admin/pageerror")
    }
}

export const deleteBrand= async(req,res)=>{
    try {
        const {id}=req.query;
        if(!id){
            return res.status(400).redirect("/admin/pageerror")
        }
        await Brand.deleteOne({_id:id});
        res.redirect("/admin/brands")
    } catch (error) {
        console.error("Error deleting Brand",error);
        res.status(500).redirect("/admin/pageerror")
        
    }
}