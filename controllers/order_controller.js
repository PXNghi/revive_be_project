const Order = require("../models/order_model");
const DetailedOrder = require("../models/detailed_order_model");
const Product = require("../models/product_model");
const moment = require("moment-timezone");

exports.getAllOrders = async (req, res) => {
	const orders = await Order.find().sort({ created_at: -1 });
	res.status(200).json({ success: true, data: orders });
};

exports.getOrdersById = async (req, res) => {
	const orders = await Order.findById(req.params.id);
	if (!orders) {
		return res
			.status(404)
			.json({ success: false, message: "Không tìm thấy đơn hàng." });
	}
	return res.status(200).json({ success: true, data: orders });
};

exports.getAllDetailedOrdersByOrderId = async (req, res) => {
	const detailedOrders = await DetailedOrder.find({
		orderId: req.params.orderId,
	});
	if (!detailedOrders) {
		return res
			.status(404)
			.json({ success: false, message: "Không tìm thấy" });
	}
	return res.status(200).json({ success: true, data: detailedOrders });
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

exports.updateOrderByAdmin = async (req, res) => {
	try {
		const { orderId } = req.params;
		const { pickupDate, collectOption, adminNote, status, branchProcess } =
			req.body;

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
			"finished",
		];
		const allowedOptions = ["Pickup", "ComeBranch"];

		if (pickupDate !== undefined) order.pickupDate = new Date(pickupDate);
		if (collectOption !== undefined) {
			if (!allowedOptions.includes(collectOption)) {
				return res.status(400).json({
					success: false,
					message: "Hình thức thu gom không hợp lệ.",
				});
			}
			order.collectOption = collectOption;
		}
		if (adminNote !== undefined) order.adminNote = adminNote;
		if (branchProcess !== undefined) order.branchProcess = branchProcess;
		if (status !== undefined) {
			if (!allowedStatuses.includes(status)) {
				return res.status(400).json({
					success: false,
					message: "Trạng thái không hợp lệ.",
				});
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
			const currentPrice = product.price;
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
				price: item.price,
				amount: item.amount,
				image: item.image,
			});
		}

		res.status(201).json({
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

exports.getOrdersByStatusWithUserId = async (req, res) => {
	try {
		const { status } = req.params;
		const userId = req.user.id;

		const orders = await Order.find({ userId, status }).sort({ created_at: -1 });

		res.status(200).json({ success: true, data: orders });
	} catch (error) {
		console.error("Lỗi tạo đơn hàng:", error);
		res.status(500).json({
			success: false,
			message: "Đã xảy ra lỗi khi tạo đơn hàng.",
		});
	}
};

exports.getAllOrdersByStatus = async (req, res) => {
	try {
		const { status } = req.params;
		const orders = await Order.find({ status }).sort({ created_at: -1 });

		res.status(200).json({ success: true, data: orders });
	} catch (error) {
		console.error("Lỗi tạo đơn hàng:", error);
		res.status(500).json({
			success: false,
			message: "Đã xảy ra lỗi khi tạo đơn hàng.",
		});
	}
};


