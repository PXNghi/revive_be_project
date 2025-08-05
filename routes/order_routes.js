const express = require("express");
const orderController = require("../controllers/order_controller");
const { authMiddleware } = require("../middlewares/auth_middlewares");
const { adminMiddleware } = require("../middlewares/admin_middlewares");

const router = express.Router();

router.get("/get-all-orders", orderController.getAllOrders);
router.get("/get-order-by-id/:id", orderController.getOrdersById);
router.get("/get-detailed-order-by-order-id/:orderId", orderController.getAllDetailedOrdersByOrderId);
router.put("/update-order-status/:id", orderController.updateOrderStatus);
router.put("/update-order-admin/:orderId", authMiddleware, adminMiddleware, orderController.updateOrderByAdmin);
router.post("/create-new-order", authMiddleware, orderController.createOrder);
router.get("/get-user-orders-by-status/:status", authMiddleware, orderController.getOrdersByStatusWithUserId);
router.get("/get-all-orders-by-status/:status", authMiddleware, adminMiddleware, orderController.getAllOrdersByStatus);

module.exports = router;