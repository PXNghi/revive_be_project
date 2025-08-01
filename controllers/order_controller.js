const Order = require("../models/order_model");
const DetailedOrder = require("../models/detailed_order_model");

exports.getAllOrders = async (req, res) => {
	const orders = await Order.find();
	res.status(200).json(orders);
};

exports.getOrdersById = async (req, res) => {
    const orders = await Order.findById(req.params.id);
    res.status(200).json(orders);
};

exporsts.getAllDetailedOrdersByOrderId = async (req, res) => {
	const detailedOrders = await DetailedOrder.find({
		orderId: req.params.orderId,
	});
	res.status(200).json(detailedOrders);
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
			return res.status(400).json({ message: "Trạng thái không hợp lệ." });
		}

		const order = await Order.findById(orderId);
		if (!order) {
			return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
		}

		order.status = status;
		await order.save();

		res.json({ message: "Cập nhật trạng thái thành công.", order });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Đã xảy ra lỗi máy chủ." });
	}
};

exports.updateOrderByAdmin = async (req, res) => {
	try {
		const { orderId } = req.params;
		const {
			pickupDate,
			collectOption,
			adminNote,
			status,
			branchProcess,
		} = req.body;

		const order = await Order.findById(orderId);

		if (!order) {
			return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
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
				return res.status(400).json({ message: "Hình thức thu gom không hợp lệ." });
			}
			order.collectOption = collectOption;
		}
		if (adminNote !== undefined) order.adminNote = adminNote;
		if (branchProcess !== undefined) order.branchProcess = branchProcess;
		if (status !== undefined) {
			if (!allowedStatuses.includes(status)) {
				return res.status(400).json({ message: "Trạng thái không hợp lệ." });
			}
			order.status = status;
		}

		await order.save();

		return res.json({
			message: "Admin cập nhật đơn hàng thành công.",
			order,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Lỗi máy chủ." });
	}
};




