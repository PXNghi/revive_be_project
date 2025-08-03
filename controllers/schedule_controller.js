const generateTimeSlots = require("../utils/generate_time_pickup");
const Order = require("../models/order_model");

exports.getAvailablePickupSlots = async (req, res) => {
	try {
		const { date } = req.query;
		console.log(date);
		if (!date) return res.status(400).json({ message: "Thiếu ngày." });

		const startTime = new Date(`${date}T08:00:00.000Z`);
		const endTime = new Date(`${date}T22:00:00.000Z`);
		const slots = generateTimeSlots(startTime, endTime);

		const result = [];

		for (const slot of slots) {
			// count the number of orders in each time slot
			const count = await Order.countDocuments({
				pickupDate: {
					$gte: slot.start,
					$lt: slot.end,
				},
				status: { $ne: "cancelled" },
			});

			// if there are less than 3 orders, add the time slot to the available slot list
			if (count < 2) {
				result.push({
					start: slot.start,
					end: slot.end,
					available: 2 - count,
				});
			}
		}

		res.json({ success: true, date, slots: result });
	} catch (error) {
		console.error(error);
		res.status(500).json({ success: false, message: "Lỗi máy chủ." });
	}
};

exports.getDisabledDates = async (req, res) => {
	const { month } = req.query;
	const year = Number(month.split("-")[0]);
	const monthNum = Number(month.split("-")[1]) - 1;

	const disabledDates = [];

	for (let day = 1; day <= 31; day++) {
		const date = new Date(Date.UTC(year, monthNum, day));
		if (date.getMonth() !== monthNum) break;

		const startTime = new Date(
			`${month}-${String(day).padStart(2, "0")}T08:00:00.000Z`
		);
		const endTime = new Date(
			`${month}-${String(day).padStart(2, "0")}T22:00:00.000Z`
		);
		const slots = generateTimeSlots(startTime, endTime);

		let allFull = true;
		for (const slot of slots) {
			const count = await Order.countDocuments({
				pickupDate: { $gte: slot.start, $lt: slot.end },
				status: { $ne: "cancelled" },
			});
			if (count < 3) {
				allFull = false;
				break;
			}
		}
		if (allFull) disabledDates.push(date.toISOString().split("T")[0]);
	}

	return res.json({ success: true, data: disabledDates });
};
