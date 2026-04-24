const User=require('../models/user.js')
const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');

//  Register Controller 
exports.register = async (req, res) => {
  try {
    const { name, email, mobile, age, password, confirmPassword, createdBy } = req.body;

    console.log("➡️ Register API called");

    // ✅ validation
    if (!name || !email || !mobile || !age || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // ✅ password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match"
      });
    }

    // ✅ check existing user
    const existingUser = await User.findOne({
      $or: [{ email }, { mobile }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    // ✅ create user (password auto hashed from schema)
    const user = await User.create({
      name,
      email,
      mobile,
      age,
      password,
      createdBy
    });

    console.log("✅ User registered");

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user
    });

  } catch (error) {
    console.log("❌ Register error:", error.message);

    res.status(500).json({
      success: false,
      message: "Registration failed"
    });
  }
};

// Login Controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("➡️ Login API called");

    // ✅ check fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required"
      });
    }

    // ✅ find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // ✅ compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // 🔐 generate token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      "secretkey", // later move to .env
      { expiresIn: "1h" }
    );

    console.log("✅ Login successful");

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });

  } catch (error) {
    console.log("❌ Login error:", error.message);

    res.status(500).json({
      success: false,
      message: "Login failed"
    });
  }
};
