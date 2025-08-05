function generateTimeSlots(startTime, endTime, intervalMinutes = 60, breakMinutes = 30) {
	const slots = [];

	let current = startTime;
	while (current.plus({ minutes: intervalMinutes }) <= endTime) {
		const next = current.plus({ minutes: intervalMinutes });
		slots.push({
			start: current,
			end: next,
		});
		
		current = next.plus({ minutes: breakMinutes });
	}

	return slots;
}

module.exports = generateTimeSlots;
