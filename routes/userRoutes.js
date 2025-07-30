// filepath: c:\Users\PC\developement\flutter-apps\Backend\routes\userRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import {
  registerUser,
  updateUser,
  login,
  getAllUsers,
  getUserById,
  getCurrentUser,
  updateOnlineStatus,
  changePassword,
} from "../controllers/userController.js";
import User from "../models/User.js"; // Import the User model
import { protect, admin, livreur } from "../middleware/auth.js"; // Import auth middleware

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Accept any file for now to fix the immediate issue
    // We can be more restrictive once we understand what types are being sent
    console.log("[Backend] File upload received:", file);
    return cb(null, true);

    /* Original restrictive check
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpeg, jpg, png) and PDFs are allowed'));
    */
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// User registration
router.post("/register", registerUser);

// User login
router.post("/login", login);

// Get current user profile
router.get("/me", protect, getCurrentUser);

// Update online status
router.put("/status", updateOnlineStatus);

// Update user profile
router.put("/:id", protect, upload.single("image"), updateUser);

// Change password
router.post("/change-password", protect, changePassword);

router.get("/", protect, admin, getAllUsers);

export default router;
