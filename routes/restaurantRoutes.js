import express from "express";
import multer from "multer";
import {
  createRestaurant,
  deleteRestaurant,
  getRestaurantById,
  getRestaurants,
  rateRestaurant,
  updateRestaurant,
  getFoodsByRestaurant,
} from "../controllers/restaurantController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

// Configure multer for restaurant image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/restaurants/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage });

// Public access routes
router.get("/", getRestaurants); // Get all restaurants (public access)
router.get("/:id/foods", getFoodsByRestaurant); // Get all foods for a restaurant
router.get("/:id", getRestaurantById); // Get restaurant by ID (public access)

// Admin routes for creating/updating restaurants with image file upload
// These routes expect 'multipart/form-data' and will handle file uploads
router.post(
  "/with-image",
  protect,
  admin,
  upload.single("image"),
  createRestaurant
); // Create with image upload
router.put(
  "/:id/with-image",
  protect,
  admin,
  upload.single("image"),
  updateRestaurant
); // Update with image upload

// Admin routes for creating/updating restaurants without direct image file upload
// These routes expect 'application/json' and can include imageUrl as a string in the body
// Your populate_db.py script should target these routes.
router.post("/", protect, admin, createRestaurant); // Create without image upload (accepts JSON)
router.put("/:id", protect, admin, updateRestaurant); // Update without image upload (accepts JSON)

// Other admin routes
router.delete("/:id", protect, admin, deleteRestaurant); // Delete a restaurant (admin only)
router.post("/:id/rate", protect, rateRestaurant); // Rate a restaurant (authenticated users)

export default router;
