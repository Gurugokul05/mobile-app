const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your_jwt_secret",
      );
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res
          .status(401)
          .json({ message: "Not authorized, user not found" });
      }
      req.user = user;
      next();
      return;
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  res.status(401).json({ message: "Not authorized, no token" });
};

const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (roles.includes(req.user.role)) {
      next();
      return;
    }

    res.status(403).json({ message: "Forbidden: insufficient role" });
  };

const admin = authorize("admin");
const seller = authorize("seller");
const buyer = authorize("buyer");
const adminOrSeller = authorize("admin", "seller");

module.exports = { protect, authorize, adminOrSeller, admin, seller, buyer };
