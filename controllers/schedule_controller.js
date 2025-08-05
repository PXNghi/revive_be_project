const generateTimeSlots = require("../utils/generate_time_pickup");
const Order = require("../models/order_model");
const { DateTime } = require("luxon");

exports.getAvailablePickupSlots = async (req, res) => {
	try {
		const { date } = req.query;
		if (!date) return res.status(400).json({ message: "Thiếu ngày." });

		const startTime = DateTime.fromISO(`${date}T08:00:00`, {
			zone: "Asia/Ho_Chi_Minh",
		});
		const endTime = DateTime.fromISO(`${date}T22:00:00`, {
			zone: "Asia/Ho_Chi_Minh",
		});

		const slots = generateTimeSlots(startTime, endTime);

		const result = [];

		for (const slot of slots) {
			const count = await Order.countDocuments({
				slotStart: {
					$gte: slot.start.toJSDate(),
					$lt: slot.end.toJSDate(),
				},
				status: { $ne: "cancelled" },
			});

			if (count < 2) {
				result.push({
					start: slot.start.toISO(),
					end: slot.end.toISO(),
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
	if (!month) return res.status(400).json({ message: "Thiếu tháng." });

	const year = Number(month.split("-")[0]);
	const monthNum = Number(month.split("-")[1]) - 1;

	const disabledDates = [];

	for (let day = 1; day <= 31; day++) {
		const date = new Date(Date.UTC(year, monthNum, day));
		if (date.getMonth() !== monthNum) break;

		const dayString = `${month}-${String(day).padStart(2, "0")}`;
		const startTime = new Date(`${dayString}T08:00:00.000Z`);
		const endTime = new Date(`${dayString}T22:00:00.000Z`);
		const slots = generateTimeSlots(startTime, endTime);

		let allFull = true;
		for (const slot of slots) {
			const count = await Order.countDocuments({
				slotStart: { $gte: slot.start, $lt: slot.end },
				status: { $ne: "cancelled" },
			});

			if (count < 2) {
				allFull = false;
				break;
			}
		}

		if (allFull) {
			disabledDates.push(date.toISOString().split("T")[0]);
		}
	}

	return res.json({ success: true, data: disabledDates });
};

