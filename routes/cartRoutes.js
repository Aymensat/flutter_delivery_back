import express from "express";
import Cart from "../models/Cart.js";
import { protect } from "../middleware/auth.js"; // Import middleware

const router = express.Router();

// Route 1: Get all cart items for the logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`Backend: GET /cart - User ID from token: ${userId}`);
    const cartItems = await Cart.find({ user: userId })
      .populate("food")
      .populate("user");
    console.log(
      `Backend: GET /cart - Found ${cartItems.length} cart items for user ${userId}`
    );
    res.json(cartItems);
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ error: "Error fetching cart items" });
  }
});

// Route 2: Add a new item to the cart or update quantity if it has the same excluded ingredients
router.post("/", protect, async (req, res) => {
  const { foodId, quantity, excludedIngredients } = req.body;
  const userId = req.user.id;
  console.log(
    `Backend: POST /cart - Received request for foodId: ${foodId}, quantity: ${quantity}, excludedIngredients: ${JSON.stringify(
      excludedIngredients
    )}, User ID from token: ${userId}`
  );

  try {
    // Find a cart item that matches the food AND the exact excluded ingredients
    let cartItem = await Cart.findOne({
      user: userId,
      food: foodId,
      excludedIngredients: excludedIngredients
    });

    if (cartItem) {
      // If a true match is found, update the quantity
      cartItem.quantity += quantity;
      await cartItem.save();
      console.log(
        `Backend: POST /cart - Updated existing cart item: ${cartItem._id}, new quantity: ${cartItem.quantity}`
      );
      await cartItem.populate("food");
      await cartItem.populate("user");
      return res.status(200).json(cartItem);
    } else {
      // If no exact match is found, create a NEW cart item
      const newCartItem = new Cart({
        user: userId,
        food: foodId,
        quantity: quantity,
        excludedIngredients: excludedIngredients
      });
      await newCartItem.save();
      console.log(
        `Backend: POST /cart - Created new cart item: ${newCartItem._id}`
      );
      await newCartItem.populate("food");
      await newCartItem.populate("user");
      return res.status(201).json(newCartItem);
    }
  } catch (error) {
    console.error("Error adding/updating cart item:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Error adding item to cart" });
  }
});

// Route 3: Update quantity or excluded ingredients of an existing cart item
router.put("/:id", protect, async (req, res) => {
  const { quantity, excludedIngredients } = req.body;
  const cartItemId = req.params.id;
  const userId = req.user.id;
  console.log(
    `Backend: PUT /cart/${cartItemId} - Received request for quantity: ${quantity}, excludedIngredients: ${JSON.stringify(
      excludedIngredients
    )}, User ID from token: ${userId}`
  );

  try {
    const updatedCartItem = await Cart.findByIdAndUpdate(
      req.params.id,
      {
        $set: { // Use $set to ensure fields are updated
          quantity: quantity,
          excludedIngredients: excludedIngredients
        }
      },
      { new: true } // Return the updated document
    );

    if (!updatedCartItem) {
      return res.status(404).send('Cart item not found.');
    }

    res.status(200).json(updatedCartItem);

  } catch (error) {
    console.error("Error updating cart item:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Error updating cart item" });
  }
});

// Route 4: Clear all cart items for the logged-in user
router.delete("/clear", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`Backend: DELETE /cart/clear - User ID from token: ${userId}`);
    const result = await Cart.deleteMany({ user: userId });
    if (result.deletedCount === 0) {
      console.log(
        `Backend: DELETE /cart/clear - No items to clear for user ${userId}.`
      );
      return res.status(200).json({ message: "No items to clear in cart." });
    }
    console.log(
      `Backend: DELETE /cart/clear - Successfully cleared ${result.deletedCount} items for user ${userId}.`
    );
    res.status(204).send();
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ error: "Error clearing cart" });
  }
});

// Route 5: Delete a specific cart item
router.delete("/:id", protect, async (req, res) => {
  const cartItemId = req.params.id;
  const userId = req.user.id;
  console.log(
    `Backend: DELETE /cart/${cartItemId} - User ID from token: ${userId}`
  );

  try {
    const result = await Cart.deleteOne({ _id: cartItemId, user: userId });

    if (result.deletedCount === 0) {
      console.warn(
        `Backend: DELETE /cart/${cartItemId} - Cart item not found or does not belong to user ${userId}`
      );
      return res
        .status(404)
        .json({ error: "Cart item not found or does not belong to user" });
    }

    console.log(
      `Backend: DELETE /cart/${cartItemId} - Successfully deleted cart item.`
    );
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting cart item:", error);
    res.status(500).json({ error: "Error deleting cart item" });
  }
});

// Existing /count route (no changes needed)
router.get("/count", async (req, res) => {
  const count = await Cart.countDocuments();
  res.json({ count });
});

export default router;
