import express from "express";
import Cart from "../models/Cart.js";
import { protect } from "../middleware/auth.js"; // Import middleware

const router = express.Router();

// Route 1: Get all cart items for the logged-in user
// This route requires authentication (protect middleware) and gets user ID from the token.
router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user.id; // User ID from the authenticated token
    console.log(`Backend: GET /cart - User ID from token: ${userId}`); // Log user ID
    // Populate both 'food' and 'user' fields to get full details
    // Ensure your Cart model schema allows populating 'user' if it's a ref to User
    const cartItems = await Cart.find({ user: userId })
      .populate("food")
      .populate("user");
    console.log(
      `Backend: GET /cart - Found ${cartItems.length} cart items for user ${userId}`
    ); // Log count
    res.json(cartItems);
  } catch (error) {
    console.error("Error fetching cart items:", error); // Log the actual error
    res.status(500).json({ error: "Error fetching cart items" });
  }
});

// Route 2: Add a new item to the cart
// This route now uses 'protect' middleware and gets user ID from the token.
router.post("/", protect, async (req, res) => {
  // ADDED 'protect' middleware here
  const { foodId, quantity } = req.body;
  const userId = req.user.id; // GET USER ID FROM AUTHENTICATED TOKEN
  console.log(
    `Backend: POST /cart - Received request for foodId: ${foodId}, quantity: ${quantity}, User ID from token: ${userId}`
  ); // Log received data

  try {
    // Check if the item already exists for this user and food
    let cartItem = await Cart.findOne({ user: userId, food: foodId });

    if (cartItem) {
      // If it exists, update the quantity
      cartItem.quantity += quantity;
      await cartItem.save();
      console.log(
        `Backend: POST /cart - Updated existing cart item: ${cartItem._id}, new quantity: ${cartItem.quantity}`
      ); // Log update
      // Re-populate for the response
      await cartItem.populate("food");
      await cartItem.populate("user");
      return res.status(200).json(cartItem);
    } else {
      // If it doesn't exist, create a new cart item
      cartItem = new Cart({ user: userId, food: foodId, quantity });
      await cartItem.save();
      console.log(
        `Backend: POST /cart - Created new cart item: ${cartItem._id}`
      ); // Log creation
      // Re-populate for the response
      await cartItem.populate("food");
      await cartItem.populate("user");
      return res.status(201).json(cartItem);
    }
  } catch (error) {
    console.error("Error adding/updating cart item:", error); // Log the actual error
    // Mongoose validation errors will have 'name' as 'ValidationError'
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Error adding item to cart" });
  }
});

// Route 5: Clear all cart items for the logged-in user
// This route requires authentication (protect middleware).
// IMPORTANT: This route MUST be defined BEFORE router.delete("/:id")
router.delete("/clear", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`Backend: DELETE /cart/clear - User ID from token: ${userId}`); // Log user ID
    const result = await Cart.deleteMany({ user: userId });
    if (result.deletedCount === 0) {
      console.log(
        `Backend: DELETE /cart/clear - No items to clear for user ${userId}.`
      ); // Log no items
      return res.status(200).json({ message: "No items to clear in cart." });
    }
    console.log(
      `Backend: DELETE /cart/clear - Successfully cleared ${result.deletedCount} items for user ${userId}.`
    ); // Log cleared count
    res.status(204).send(); // No content to send back on successful deletion
  } catch (error) {
    console.error("Error clearing cart:", error); // Log the actual error
    res.status(500).json({ error: "Error clearing cart" });
  }
});

// Route 4: Delete a specific cart item
// This route uses 'protect' middleware to ensure the user owns the item.
// IMPORTANT: This route MUST be defined AFTER router.delete("/clear")
router.delete("/:id", protect, async (req, res) => {
  const cartItemId = req.params.id;
  const userId = req.user.id; // Get user ID from the token
  console.log(
    `Backend: DELETE /cart/${cartItemId} - User ID from token: ${userId}`
  ); // Log user ID

  try {
    // Find and delete the cart item, ensuring it belongs to the authenticated user
    const result = await Cart.deleteOne({ _id: cartItemId, user: userId });

    if (result.deletedCount === 0) {
      console.warn(
        `Backend: DELETE /cart/${cartItemId} - Cart item not found or does not belong to user ${userId}`
      ); // Log warning
      return res
        .status(404)
        .json({ error: "Cart item not found or does not belong to user" });
    }

    console.log(
      `Backend: DELETE /cart/${cartItemId} - Successfully deleted cart item.`
    ); // Log deletion
    res.status(204).send(); // No content to send back on successful deletion
  } catch (error) {
    console.error("Error deleting cart item:", error); // Log the actual error
    res.status(500).json({ error: "Error deleting cart item" });
  }
});

// Route 3: Update quantity of an existing cart item
// This route uses 'protect' middleware to get userId from token.
router.put("/:id", protect, async (req, res) => {
  const { quantity } = req.body;
  const cartItemId = req.params.id;
  const userId = req.user.id; // Get user ID from the token
  console.log(
    `Backend: PUT /cart/${cartItemId} - Received request for quantity: ${quantity}, User ID from token: ${userId}`
  ); // Log received data

  try {
    // Find the cart item by its ID and ensure it belongs to the authenticated user
    const cartItem = await Cart.findOne({ _id: cartItemId, user: userId });

    if (!cartItem) {
      console.warn(
        `Backend: PUT /cart/${cartItemId} - Cart item not found or does not belong to user ${userId}`
      ); // Log warning
      return res
        .status(404)
        .json({ error: "Cart item not found or does not belong to user" });
    }

    cartItem.quantity = quantity;
    await cartItem.save();
    console.log(
      `Backend: PUT /cart/${cartItemId} - Updated cart item quantity to: ${cartItem.quantity}`
    ); // Log update

    // Populate food and user details before sending the response
    await cartItem.populate("food");
    await cartItem.populate("user");

    res.status(200).json(cartItem);
  } catch (error) {
    console.error("Error updating cart item quantity:", error); // Log the actual error
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Error updating cart item quantity" });
  }
});

// Existing /count route (no changes needed)
router.get("/count", async (req, res) => {
  // Note: This route does not use 'protect', so it will count all carts.
  // If you want to count only for a specific user, add 'protect' middleware.
  const count = await Cart.countDocuments();
  res.json({ count });
});

export default router;
