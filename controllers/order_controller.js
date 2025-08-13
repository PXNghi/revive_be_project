const Order = require("../models/order_model");
const DetailedOrder = require("../models/detailed_order_model");
const Product = require("../models/product_model");
const Category = require("../models/category_model");

exports.getAllOrders = async (req, res) => {
	const orders = await Order.find().sort({ created_at: -1 });
	res.status(200).json({ success: true, data: orders });
};

exports.getAllDetailedOrdersByOrderId = async (req, res) => {
	try {
		const detailedOrders = await DetailedOrder.find({
			orderId: req.params.orderId,
		}).populate({
			path: "productId",
			select: "name category",
			populate: {
				path: "category",
				select: "category_name",
			},
		});

		if (!detailedOrders) {
			return res
				.status(404)
				.json({ success: false, message: "Không tìm thấy" });
		}
		return res.status(200).json({ success: true, data: detailedOrders });
	} catch (error) {
		console.log("Error in getAllDetailedOrdersByOrderId: ", error);
		return res.status(500).json({ success: false, message: error.message });
	}
};

exports.updateOrderStatus = async (req, res) => {
	try {
		const { orderId } = req.params;
		const { status } = req.body;

		const allowedStatuses = [
			"cancelled",
			"waiting",
			"confirmed",
			"delivering",
			"finished",
		];

		if (!allowedStatuses.includes(status)) {
			return res
				.status(400)
				.json({ success: false, message: "Trạng thái không hợp lệ." });
		}

		const order = await Order.findById(orderId);
		if (!order) {
			return res
				.status(404)
				.json({ success: false, message: "Không tìm thấy đơn hàng." });
		}

		order.status = status;
		await order.save();

		res.json({
			success: true,
			message: "Cập nhật trạng thái thành công.",
			data: order,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: "Đã xảy ra lỗi máy chủ.",
		});
	}
};

// exports.updateOrderByAdmin = async (req, res) => {
// 	try {
// 		const { orderId } = req.params;
// 		const { pickupDate, deliveringStartTime, orderFinishTime, adminNote, status } =
// 			req.body;

// 		const order = await Order.findById(orderId);

// 		if (!order) {
// 			return res
// 				.status(404)
// 				.json({ success: false, message: "Không tìm thấy đơn hàng." });
// 		}

// 		const allowedStatuses = [
// 			"cancelled",
// 			"waiting",
// 			"confirmed",
// 			"delivering",
// 			"completed",
// 		];

// 		if (pickupDate !== undefined) order.pickUpDate = new Date(pickupDate);
// 		if (adminNote !== undefined) order.adminNote = adminNote;
// 		if (deliveringStartTime !== undefined)
// 			order.startTime = deliveringStartTime;
// 		if (orderFinishTime !== undefined)
// 			order.endTime = orderFinishTime;
// 		if (status !== undefined) {
// 			if (!allowedStatuses.includes(status)) {
// 				return res.status(400).json({
// 					success: false,
// 					message: "Trạng thái không hợp lệ.",
// 				});
// 			}
// 			order.status = status;
// 		}

// 		await order.save();

// 		return res.json({
// 			success: true,
// 			message: "Admin cập nhật đơn hàng thành công.",
// 			data: order,
// 		});
// 	} catch (error) {
// 		console.error(error);
// 		return res
// 			.status(500)
// 			.json({ success: false, message: "Lỗi máy chủ." });
// 	}
// };

exports.updateOrderByAdmin = async (req, res) => {
	try {
		const { orderId } = req.params;
		const {
			pickupDate,
			deliveringStartTime,
			orderFinishTime,
			adminNote,
			status,
			totalPrice,
		} = req.body;

		const order = await Order.findById(orderId);

		if (!order) {
			return res
				.status(404)
				.json({ success: false, message: "Không tìm thấy đơn hàng." });
		}

		const allowedStatuses = [
			"cancelled",
			"waiting",
			"confirmed",
			"delivering",
			"completed",
		];

		if (pickupDate !== undefined) order.pickUpDate = new Date(pickupDate);
		if (adminNote !== undefined) order.adminNote = adminNote;
		if (deliveringStartTime !== undefined)
			order.startTime = deliveringStartTime;
		if (orderFinishTime !== undefined) order.endTime = orderFinishTime;
		if (totalPrice !== undefined) order.totalPrice = totalPrice;

		if (status !== undefined) {
			if (!allowedStatuses.includes(status)) {
				return res.status(400).json({
					success: false,
					message: "Trạng thái không hợp lệ.",
				});
			}

			if (totalPrice === "" || totalPrice === null || totalPrice === undefined) {
				return res
					.status(400)
					.json({ success: false, message: "Cần nhập tổng tiền của đơn hàng!" });
			}

			// if old status is not completed and new status is completed
			if (status === "completed" && order.status !== "completed") {
				const detailedOrders = await DetailedOrder.find({
					orderId: order._id,
				});

				await Promise.all(
					detailedOrders.map(async (detail) => {
						// add to amount
						const updatedProduct = await Product.findByIdAndUpdate(
							detail.productId,
							{ $inc: { amount: detail.amount } },
							{ new: true }
						);

						// if product existed and has category
						if (updatedProduct && updatedProduct.category) {
							await Category.findByIdAndUpdate(
								updatedProduct.category,
								{ $inc: { category_amount: detail.amount } }
							);
						}
					})
				);
			}

			order.status = status;
		}

		await order.save();

		return res.json({
			success: true,
			message: "Admin cập nhật đơn hàng thành công.",
			data: order,
		});
	} catch (error) {
		console.error(error);
		return res
			.status(500)
			.json({ success: false, message: "Lỗi máy chủ." });
	}
};

exports.createOrder = async (req, res) => {
	try {
		const {
			userName,
			userPhone,
			userAddress,
			pickUpDate,
			userNote,
			products,
		} = req.body;

		if (
			!userName ||
			!userPhone ||
			!userAddress ||
			!pickUpDate ||
			!products ||
			!Array.isArray(products) ||
			products.length === 0
		) {
			return res
				.status(400)
				.json({ success: false, message: "Thiếu thông tin đơn hàng." });
		}

		let totalPrice = 0;
		let currentPrice = 0;
		for (const item of products) {
			const product = await Product.findById(item.productId);
			if (!product) {
				return res.status(400).json({
					success: false,
					message: "Thông tin sản phẩm không hợp lệ.",
				});
			}
			if (!product.amount) {
				item.amount = 1;
			}
			currentPrice = product.price;
			totalPrice += currentPrice * item.amount;
		}

		const newOrder = await Order.create({
			userId: req.user.id,
			userName,
			userPhone,
			userAddress,
			pickUpDate,
			userNote,
			totalPrice,
			status: "waiting",
		});

		for (const item of products) {
			await DetailedOrder.create({
				orderId: newOrder._id,
				productId: item.productId,
				price: currentPrice,
				amount: item.amount,
				image: item.image,
			});
		}

		return res.status(201).json({
			success: true,
			message: "Tạo đơn hàng thành công.",
			data: newOrder,
		});
	} catch (error) {
		console.error("Lỗi tạo đơn hàng:", error);
		res.status(500).json({
			success: false,
			message: "Đã xảy ra lỗi khi tạo đơn hàng.",
		});
	}
};

const getOrdersWithDetails = async (filter, res) => {
	try {
		const sortField =
			filter.status === "cancelled" ? "updated_at" : "created_at";

		const orders = await Order.find(filter)
			.sort({ [sortField]: -1 })
			.lean();

		const orderIds = orders.map((order) => order._id);

		const detailedOrders = await DetailedOrder.find({
			orderId: { $in: orderIds },
		})
			.populate({
				path: "productId",
				select: "name category",
				populate: {
					path: "category",
					select: "category_name",
				},
			})
			.lean();

		const detailedMap = {};
		detailedOrders.forEach((item) => {
			const orderId = item.orderId.toString();
			if (!detailedMap[orderId]) detailedMap[orderId] = [];
			detailedMap[orderId].push(item);
		});

		const finalResult = orders.map((order) => ({
			...order,
			detailedOrders: detailedMap[order._id.toString()] || [],
		}));

		res.status(200).json({ success: true, data: finalResult });
	} catch (error) {
		console.error("Lỗi khi lấy đơn hàng có chi tiết:", error);
		res.status(500).json({
			success: false,
			message: "Đã xảy ra lỗi khi lấy đơn hàng.",
		});
	}
};

exports.getOrdersByStatusWithUserId = async (req, res) => {
	const { status } = req.params;
	const userId = req.user.id;

	let statusFilter =
		status === "confirmed" ? { $in: ["confirmed", "delivering"] } : status;

	await getOrdersWithDetails({ userId, status: statusFilter }, res);
};

exports.getAllOrdersByStatus = async (req, res) => {
	const { status } = req.params;

	let statusFilter =
		status === "confirmed" ? { $in: ["confirmed", "delivering"] } : status;

	await getOrdersWithDetails({ status: statusFilter }, res);
};

exports.getOrdersById = async (req, res) => {
	const orders = await Order.findById(req.params.id);
	if (!orders) {
		return res
			.status(404)
			.json({ success: false, message: "Không tìm thấy đơn hàng." });
	}
	await getOrdersWithDetails({ _id: req.params.id }, res);
};
