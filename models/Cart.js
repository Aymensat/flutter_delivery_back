import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  food: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },
  quantity: { type: Number, required: true, min: 1 },
  /**
   * @description A list of ingredients that the user wants to exclude from the food item.
   * @example ["onions", "tomatoes"]
   */
  excludedIngredients: [{ type: String }],
});

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
