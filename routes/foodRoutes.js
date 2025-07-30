import express from "express";
import multer from "multer";
import {
  createFoodItem,
  getFoodItems,
  getFoodItemById,
  updateFoodItem,
  deleteFoodItem,
  rateFood,
} from "../controllers/foodController.js";
import { protect, admin } from "../middleware/auth.js";
import Food from "../models/Food.js"; // Ensure Food model is imported

const router = express.Router();

// Configure multer to save files to disk in 'uploads/foods' folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/foods/");
  },
  filename: function (req, file, cb) {
    // Use Date.now() to avoid name collisions
    cb(null, Date.now() + "_" + file.originalname);
  },
});
const upload = multer({ storage });

// Public access routes
router.get("/", getFoodItems); // Get all food items (public access)
router.get("/get", getFoodItems); // Additional route to match frontend request (public access)
router.get("/:id", getFoodItemById); // Get food item by ID (public access)

// Admin routes for creating/updating food items with image file upload
// These routes expect 'multipart/form-data' and will handle file uploads
router.post(
  "/with-image",
  protect,
  admin,
  upload.single("image"),
  createFoodItem
); // Create with image upload
router.put(
  "/:id/with-image",
  protect,
  admin,
  upload.single("image"),
  updateFoodItem
); // Update with image upload

// Admin routes for creating/updating food items without direct image file upload
// These routes expect 'application/json' and can include imageUrl as a string in the body
// Your populate_db.py script should target these routes.
router.post("/", protect, admin, createFoodItem); // Create without image upload (accepts JSON)
router.put("/:id", protect, admin, updateFoodItem); // Update without image upload (accepts JSON)

// Other admin routes
router.delete("/:id", protect, admin, deleteFoodItem); // Delete a food item (admin only)
router.post("/:id/rate", protect, rateFood); // Rate a food item (authenticated users only)

// Upload food image (specific endpoint for image-only upload)
router.post(
  "/upload-image/:id",
  protect,
  admin,
  upload.single("image"),
  async (req, res) => {
    try {
      const food = await Food.findById(req.params.id);
      if (!food) return res.status(404).json({ message: "Food not found" });

      food.imageUrl = `/uploads/foods/${req.file.filename}`;
      await food.save();

      res.json({ imageUrl: food.imageUrl });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Image upload failed", error: err.message });
    }
  }
);

export default router;
