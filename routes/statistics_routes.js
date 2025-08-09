const express = require("express");
const statisticsController = require("../controllers/statistics_controller");
const { authMiddleware } = require("../middlewares/auth_middlewares");
const { adminMiddleware } = require("../middlewares/admin_middlewares");

const router = express.Router();

router.get(
	"/get-monthly-revenue/:year",
	authMiddleware,
	adminMiddleware,
	statisticsController.getMonthlyRevenue
);
router.get(
	"/get-amount-product-by-category/:categoryId",
	authMiddleware,
	adminMiddleware,
	statisticsController.getAmountOfProductByCategory
);
router.get(
	"/get-product-sales-in-year",
	authMiddleware,
	adminMiddleware,
	statisticsController.getScrapQuantityByMonth
);

module.exports = router;
