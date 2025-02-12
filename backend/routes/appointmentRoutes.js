const express = require('express');
const router = express.Router();
const { createAppointmentSlot,getAvailableSlots, createAppointment,updateSlotStatus,getUserAppointments,cancelAppointment,deleteSlot,getAllAppointmentSlots} = require('../controllers/appointmentController');

// POST route to create an appointment slot
router.post('/create', createAppointmentSlot);

// Route to fetch available slots
router.get("/available-slots", getAvailableSlots);

// Route to book an appointment
router.post("/book", createAppointment);

// Route to update slot status
router.put("/update-slot/:slotId", updateSlotStatus);

// Route to fetch appointments booked by the logged-in user using their email
router.get("/user/:email", getUserAppointments);

// Route to cancel an appointment
router.delete("/cancel/:appointmentId", cancelAppointment);

// Delete an appointment slot by ID
router.delete("/delete-slot/:slotId", deleteSlot);

// Route to get all appointment slots
router.get("/appointment-slots", getAllAppointmentSlots);

module.exports = router;
