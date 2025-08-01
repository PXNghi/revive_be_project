function generateTimeSlots(startTime, endTime, intervalMinutes = 60) {
	const slots = [];
	let current = new Date(startTime);

	while (current < endTime) {
		const next = new Date(current.getTime() + intervalMinutes * 60000);
		slots.push({
			start: new Date(current),
			end: new Date(next),
		});
		current = next;
	}
	return slots;
}
module.exports = generateTimeSlots;
