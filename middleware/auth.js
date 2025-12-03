
import User from '../models/userModel.js';

export const userAuth = async (req, res, next) => {
  try {
    if (!req.session.user) {
      
      
      return res.redirect("/login");
    }

    const user = await User.findById(req.session.user);

    if (user && !user.isBlocked) {

      return next();
    }
if (user.isBlocked) {
      req.session.destroy(() => {
        return res.redirect("/login");
      });
      return;
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
