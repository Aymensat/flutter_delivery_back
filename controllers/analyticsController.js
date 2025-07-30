import Delivery from "../models/Delivery.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Food from "../models/Food.js";
import Restaurant from "../models/Restaurant.js";

/**
 * Get general analytics data
 * @route   GET /api/analytics
 * @access  Private/Admin
 */
export const getAnalytics = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Get counts for today
    const [
      todayOrdersCount,
      todayDeliveriesCount,
      todayRevenue,
      totalUsers,
      totalRestaurants,
      totalOrders,
      totalDeliveries,
      totalFoods,
      totalRevenue,
    ] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } }),
      Delivery.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      }),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfDay, $lte: endOfDay } } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
      User.countDocuments(),
      Restaurant.countDocuments(),
      Order.countDocuments(),
      Delivery.countDocuments(),
      Food.countDocuments(),
      Order.aggregate([
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
    ]);

    // Get orders and revenue by date for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const ordersByDate = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
          revenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // Format the date data for the chart
    const chartData = ordersByDate.map((item) => ({
      date: `${item._id.year}-${item._id.month
        .toString()
        .padStart(2, "0")}-${item._id.day.toString().padStart(2, "0")}`,
      orders: item.count,
      revenue: item.revenue,
    }));

    res.json({
      todayStats: {
        orders: todayOrdersCount,
        deliveries: todayDeliveriesCount,
        revenue: todayRevenue.length > 0 ? todayRevenue[0].total : 0,
      },
      totalStats: {
        users: totalUsers,
        restaurants: totalRestaurants,
        orders: totalOrders,
        deliveries: totalDeliveries,
        foods: totalFoods,
        revenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      },
      chartData,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
};
