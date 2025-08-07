const express = require("express");
const scheduleController = require("../controllers/schedule_controller");

const router = express.Router();

router.get("/get-available-schedule-by-date", scheduleController.getAvailablePickupSlots);
router.get("/get-disabled-dates", scheduleController.getDisabledDates);

module.exports = router;
