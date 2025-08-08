const mongoose = require("mongoose");
const Order = require("../models/order_model");
const Category = require("../models/category_model");
const Product = require("../models/product_model");
const DetailedOrder = require("../models/detailed_order_model");

exports.getMonthlyRevenue = async (req, res) => {
	try {
		const year = parseInt(req.params.year);

		const revenue = await Order.aggregate([
			{
				$match: {
					status: "completed",
					created_at: {
						$gte: new Date(`${year}-01-01T00:00:00.000Z`),
						$lte: new Date(`${year}-12-31T23:59:59.999Z`),
					},
				},
			},
			{
				$group: {
					_id: {
						month: { $month: "$created_at" },
						year: { $year: "$created_at" },
					},
					totalRevenue: { $sum: "$totalPrice" },
					orderCount: { $sum: 1 },
				},
			},
			{ $sort: { "_id.month": 1 } },
		]);

		const result = Array.from({ length: 12 }, (_, i) => {
			const monthData = revenue.find((r) => r._id.month === i + 1);
			return {
				month: i + 1,
				year,
				totalRevenue: monthData ? monthData.totalRevenue : 0,
				orderCount: monthData ? monthData.orderCount : 0,
			};
		});

		res.json({ success: true, data: result });
	} catch (error) {
		console.error("Error in getMonthlyRevenue:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

exports.getAmountOfProductByCategory = async (req, res) => {
	try {
		const { categoryId } = req.params;

		const category = await Category.findById(categoryId);
		if (!category) {
			return res.status(404).json({ message: "Category not found" });
		}

		const stats = await Product.aggregate([
			{ $match: { category: new mongoose.Types.ObjectId(categoryId) } },
			{
				$group: {
					_id: null,
					total_amount: { $sum: "$amount" },
					products: {
						$push: { name: "$name", amount: "$amount" },
					},
				},
			},
		]);

		return res.json({
			success: true,
			category: category.category_name,
			products: stats.length > 0 ? stats[0].products : [],
			total_amount: stats.length > 0 ? stats[0].total_amount : 0,
		});
	} catch (err) {
		res.status(500).json({ success: false, message: err.message });
	}
};

exports.getScrapQuantityByMonth = async (req, res) => {
	try {
		const { year, month } = req.query;

		const matchStage = {
			$match: {
				"orderInfo.status": "completed",
				$expr: {
					$and: [
						{
							$eq: [
								{ $year: "$orderInfo.pickUpDate" },
								parseInt(year),
							],
						},
						{
							$eq: [
								{ $month: "$orderInfo.pickUpDate" },
								parseInt(month),
							],
						},
					],
				},
			},
		};

		const stats = await DetailedOrder.aggregate([
			// Join Order
			{
				$lookup: {
					from: "orders",
					localField: "orderId",
					foreignField: "_id",
					as: "orderInfo",
				},
			},
			{ $unwind: "$orderInfo" },
			matchStage,

			// Join Product
			{
				$lookup: {
					from: "products",
					localField: "productId",
					foreignField: "_id",
					as: "productInfo",
				},
			},
			{ $unwind: "$productInfo" },

			// Dùng $facet để tạo 3 nhóm kết quả song song
			{
				$facet: {
					// 1. Tổng tháng
					totalMonth: [
						{
							$group: {
								_id: null,
								totalKg: { $sum: "$amount" },
								totalVND: {
									$sum: {
										$multiply: [
											"$amount",
											"$productInfo.price",
										],
									},
								},
							},
						},
					],

					// 2. Bar chart (theo ngày)
					barChart: [
						{
							$group: {
								_id: {
									day: {
										$dayOfMonth: "$orderInfo.pickUpDate",
									},
								},
								totalKg: { $sum: "$amount" },
							},
						},
						{ $project: { day: "$_id.day", totalKg: 1, _id: 0 } },
						{ $sort: { day: 1 } },
					],

					// 3. Pie chart (tỉ lệ từng loại phế liệu)
					pieChart: [
						{
							$group: {
								_id: "$productInfo.name",
								totalKg: { $sum: "$amount" },
							},
						},
						{ $sort: { totalKg: -1 } },
					],
				},
			},
		]);

		// Lấy dữ liệu ra
		const result = stats[0];
		const totalKg = result.totalMonth[0]?.totalKg || 0;
		const totalVND = result.totalMonth[0]?.totalVND || 0;

		// Tính % cho pie chart
		const pieChartWithPercent = result.pieChart.map((item) => ({
			productName: item._id,
			totalKg: item.totalKg,
			percent: totalKg > 0 ? (item.totalKg / totalKg) * 100 : 0,
		}));

		res.json({
			success: true,
			data: {
				total: {
					kg: totalKg,
					vnd: totalVND,
				},
				barChart: result.barChart,
				pieChart: pieChartWithPercent,
			},
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: "Lỗi khi thống kê" });
	}
};
