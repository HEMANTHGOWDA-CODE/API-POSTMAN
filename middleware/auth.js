const jwt = require('jsonwebtoken');
let key="nf8347fy4yfb8347gfb347gfb34gf634b34f"
const authMiddleware = (req, res, next) => {
  try {
    console.log("➡️ Auth middleware called");

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, key);

    // attach user info
    req.user = decoded;

    console.log("✅ Token verified:", decoded);

    next();

  } catch (error) {
    console.log("❌ Token error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

module.exports = authMiddleware;