
import User from '../models/userModel.js';
export const userAuth = async (req, res, next) => {
  try {
    const user=req.session.user;

    if (user&&!user.isBlocked||req.user && !req.user.isBlocked) {
      return next();
    }

    if (user&&user.isBlocked||req.user && req.user.isBlocked) {
      req.logout();  
      req.session.destroy(() => {
        console.log("User blocked");
        return res.redirect("/login");
      });
    }
  } catch (error) {
    console.error("Error in userAuth middleware:", error);
    res.status(500).send("Internal Server Error");
  }
};



export const adminAuth = async (req, res, next) => {
  try {
    if (!req.session.admin) {
      return res.redirect("/admin/login");
    }

    const admin = await User.findById(req.session.admin);

    if (admin && admin.isAdmin) {
      return next();
    }

    return res.redirect("/admin/login");

  } catch (error) {
    console.error("Error in adminAuth middleware:", error);
    res.status(500).send("Internal Server Error");
  }
};
