
exports.getAvailablePickupSlots = async (req, res) => {
	try {
		const { date } = req.query;
		if (!date) return res.status(400).json({ message: "Thiếu ngày." });

		// create available time slots from 8 to 22
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
			if (count < 3) {
				result.push({
					start: slot.start,
					end: slot.end,
					available: 2 - count,
				});
			}
		}

		res.json({ date, slots: result });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Lỗi máy chủ." });
	}
};
