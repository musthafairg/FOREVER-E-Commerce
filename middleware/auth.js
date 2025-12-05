
import User from '../models/userModel.js';

export const userAuth = async (req, res, next) => {
  try {
    const sessionUser = req.session.user;
    const oauthUser = req.user;

    const activeUser = sessionUser || oauthUser;

    // If logged-in and not blocked → allow access
    if (activeUser && !activeUser.isBlocked) {
      return next();
    }

    // If user exists but IS BLOCKED → force logout
    if (activeUser && activeUser.isBlocked) {

      // Passport logout requires callback in v0.6+
      req.logout(function (err) {
        if (err) {
          console.error("Logout error:", err);
        }

        // Destroy session fully
        req.session.destroy(() => {
          console.log("Blocked user session destroyed");
          return res.redirect("/login");
        });
      });

      return;
    }

    // No logged-in user at all
    return res.redirect("/login");

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
