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
        const categoryOffer = findCategory?.categoryOffer || 0;
        const productOffer = product.productOffer || 0;
        const totalOffer = categoryOffer + productOffer;

        // Related products
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


// ================= ADD TO CART (with product availability check) =================
export const addToCart = async (req, res) => {
    try {
        const userId = req.session.user?._id || req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Login required" });
        }

        const { productId } = req.body;
        const product = await Product.findById(productId);

        if (!product || product.isBlocked || product.status !== "Available" || product.quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Product unavailable"
            });
        }

        // Example cart logic (adjust to your Cart schema)
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = await Cart.create({
                user: userId,
                items: []
            });
        }

        const existingItem = cart.items.find(
            (item) => item.product.toString() === productId.toString()
        );

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.items.push({
                product: productId,
                quantity: 1
            });
        }

        await cart.save();

        return res.json({
            success: true,
            message: "Product added to cart"
        });

    } catch (error) {
        console.error("Error adding to cart:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


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

        return res.redirect("/shop");

    } catch (error) {
        console.error("Error in demo login:", error);
        return res.redirect("/pageNotFound");
    }
};