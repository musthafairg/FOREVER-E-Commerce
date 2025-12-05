import Product from "../../models/productModel.js";
import Category from "../../models/categoryModel.js";
import User from "../../models/userModel.js";
import Cart from "../../models/cartModel.js"

// ================= PRODUCT DETAILS PAGE =================
export const productDetailes = async (req, res) => {
    try {
        const userId = req.session.user?._id || req.user?._id || null;
        const userData = userId ? await User.findById(userId) : null;

        const productId = req.query.id;
        if (!productId) return res.redirect("/shop");

        const product = await Product.findById(productId)
            .populate("category")
            .populate({
                path: "reviews.user",
                select: "name email"
            });

        if (!product) {
            return res.redirect("/shop");
        }

        // Blocked / Discontinued / Out of stock redirect on refresh
        if (product.isBlocked || product.status === "Discontinued") {
            return res.redirect("/shop");
        }

        const findCategory = product.category;

        // =============================
        //     DYNAMIC OFFER LOGIC
        // =============================
        let totalOffer = 0;

        if (product.regularPrice > 0) {
            totalOffer = Math.round(
                ((product.regularPrice - product.salePrice) / product.regularPrice) * 100
            );
        }

        // RELATED PRODUCTS
        const relatedProducts = await Product.find({
            category: findCategory._id,
            _id: { $ne: product._id },
            isBlocked: false,
            status: "Available"
        }).limit(6);

        return res.render("user/product-details", {
            user: userData,
            product,
            quantity: product.quantity,
            totalOffer,
            category: findCategory,
            relatedProducts
        });

    } catch (error) {
        console.error("Error fetching product details:", error);
        return res.redirect("/pageNotFound");
    }
};


// ================= ADD REVIEW =================
export const addReview = async (req, res) => {
    try {
        const userId = req.session.user?._id || req.user?._id;
        if (!userId) {
            return res.redirect("/login");
        }

        const { productId, rating, comment } = req.body;

        const product = await Product.findById(productId);
        if (!product || product.isBlocked || product.status === "Discontinued") {
            return res.redirect("/shop");
        }

        product.reviews.push({
            user: userId,
            rating: Number(rating),
            comment
        });

        // Recalculate avgRating
        const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
        product.avgRating = totalRating / product.reviews.length;

        await product.save();

        return res.redirect(`/productDetails?id=${productId}`);

    } catch (error) {
        console.error("Error adding review:", error);
        return res.redirect("/pageNotFound");
    }
};
