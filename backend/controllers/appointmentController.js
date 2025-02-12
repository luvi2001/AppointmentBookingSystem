const { neon } = require("@neondatabase/serverless"); // Import NeonDB
const sql = neon(process.env.DATABASE_URL); // Initialize NeonDB client

const createAppointmentSlot = async (req, res) => {
  const { date, start_time, end_time } = req.body;


  if (!date || !start_time || !end_time) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Fetch existing slots for the given date
    const existingSlots = await sql`
      SELECT * FROM appointment_slots WHERE date = ${date}
    `;

    // Convert new slot times to Date objects using a fixed reference date
    const newStartTime = new Date(`1970-01-01T${start_time}Z`);
    const newEndTime = new Date(`1970-01-01T${end_time}Z`);

    if (newStartTime >= newEndTime) {
      return res.status(400).json({ message: "End time must be after start time." });
    }

    // Check if the new slot overlaps with any existing slots
    const isOverlapping = existingSlots.some((slot) => {
      const slotStart = new Date(`1970-01-01T${slot.start_time}Z`);
      const slotEnd = new Date(`1970-01-01T${slot.end_time}Z`);

      return (
        (newStartTime >= slotStart && newStartTime < slotEnd) || // Starts inside an existing slot
        (newEndTime > slotStart && newEndTime <= slotEnd) || // Ends inside an existing slot
        (newStartTime <= slotStart && newEndTime >= slotEnd) // Completely overlaps an existing slot
      );
    });

    if (isOverlapping) {
      return res.status(400).json({ message: "Appointment slot overlaps with an existing slot." });
    }

    // Insert new appointment slot
    const result = await sql`
      INSERT INTO appointment_slots (date, start_time, end_time, status)
      VALUES (${date}, ${start_time}, ${end_time}, 'not booked')
      RETURNING id, date, start_time, end_time, status, created_at;
    `;

    res.status(201).json({
      message: "Appointment slot created successfully",
      slot: result[0],
    });
  } catch (error) {
    console.error("Error creating appointment slot:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



// Controller to get available appointment slots
const getAvailableSlots = async (req, res) => {
  try {
    // Fetch all slots that are not booked
    const availableSlots = await sql`
      SELECT id, date, start_time, end_time FROM appointment_slots WHERE status = 'not booked'
    `;

    // Adjust the date for each slot by adding one day
    const adjustedSlots = availableSlots.map(slot => {
      const slotDate = new Date(slot.date); // Create a Date object from the date

      // Add one day to the slot date
      slotDate.setDate(slotDate.getDate() + 1); // Adds one day to the date

      // Format the adjusted date to 'YYYY-MM-DD'
      const adjustedDateString = slotDate.toISOString().split('T')[0];

      return {
        ...slot,
        date: adjustedDateString, // Use the adjusted date
      };
    });
    
    // Send the adjusted slots to the frontend
    res.status(200).json({ slots: adjustedSlots });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};






const createAppointment = async (req, res) => {
  const { name, email, phone, nic, date, start_time, end_time } = req.body;

  console.log("Incoming Appointment Request:", req.body); // Debugging log

  // Validate required fields
  if (!name || !email || !phone || !nic || !date || !start_time || !end_time) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Check if the selected slot is already booked
    const existingAppointment = await sql`
      SELECT * FROM appointments 
      WHERE date = ${date} AND start_time = ${start_time} AND end_time = ${end_time}
    `;

    if (existingAppointment.length > 0) {
      return res.status(400).json({ message: "This time slot is already booked." });
    }

    // Insert the new appointment
    const result = await sql`
      INSERT INTO appointments (name, email, phone, nic, date, start_time, end_time) 
      VALUES (${name}, ${email}, ${phone}, ${nic}, ${date}, ${start_time}, ${end_time})
      RETURNING id, name, email, phone, nic, date, start_time, end_time, created_at;
    `;

    if (result.length === 0) {
      throw new Error("Failed to insert appointment.");
    }

    const appointment = result[0];

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment: {
        id: appointment.id,
        name: appointment.name,
        email: appointment.email,
        phone: appointment.phone,
        nic: appointment.nic,
        date: appointment.date,
        start_time: appointment.start_time,
        end_time: appointment.end_time,
        created_at: appointment.created_at,
      },
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Update slot status in appointment_slots table
const updateSlotStatus = async (req, res) => {
  try {
    const { slotId } = req.params;
    const { status } = req.body;

    if (!slotId || !status) {
      return res.status(400).json({ error: "Slot ID and status are required" });
    }

  
    const result = await sql`
      UPDATE appointment_slots SET status = ${status} WHERE id = ${slotId} RETURNING id, status;
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: "Slot not found" });
    }

    res.status(200).json({ message: "Slot status updated successfully", slot: result[0] });

  } catch (error) {
    console.error("Error updating slot status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Controller to get appointments booked by the logged-in user
const getUserAppointments = async (req, res) => {
  const { email } = req.params; // Get email from request params

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Fetch appointments where the email matches
    const appointments = await sql`
      SELECT id, name, email, phone, nic, date, start_time, end_time, created_at 
      FROM appointments 
      WHERE email = ${email}
      ORDER BY date DESC, start_time ASC
    `;

    if (appointments.length === 0) {
      return res.status(404).json({ message: "No appointments found" });
    }

    res.status(200).json({ appointments });
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const cancelAppointment = async (req, res) => {
  const { appointmentId } = req.params;
  const { date, start_time } = req.body;

  console.log("Received Data:", req.body);

  if (!appointmentId || !date || !start_time) {
    return res.status(400).json({ message: "Missing required data" });
  }

  try {
    const formattedDate = new Date(date).toISOString().split("T")[0]; // Ensure correct format
    const formattedTime = start_time.split(".")[0]; // Remove milliseconds if present


    // Delete the appointment
    await sql`
      DELETE FROM appointments WHERE id = ${appointmentId}
    `;

    // Update the time slot to available
    await sql`
      UPDATE appointment_slots
      SET status = 'not booked'
      WHERE date = ${formattedDate} AND start_time = ${formattedTime}
    `;

    res.status(200).json({ message: "Appointment canceled successfully" });
  } catch (error) {
    console.error("Error canceling appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Controller to delete an appointment slot
const deleteSlot = async (req, res) => {
  const { slotId } = req.params;

  // Validate that the slot ID is provided
  if (!slotId) {
    return res.status(400).json({ message: "Slot ID is required" });
  }

  try {
    // Check if the slot exists before attempting to delete it
    const existingSlot = await sql`
      SELECT * FROM appointment_slots WHERE id = ${slotId}
    `;

    if (existingSlot.length === 0) {
      return res.status(404).json({ message: "Slot not found" });
    }

    // Delete the appointment slot
    await sql`
      DELETE FROM appointment_slots WHERE id = ${slotId}
    `;

    res.status(200).json({ message: "Appointment slot deleted successfully" });
  } catch (error) {
    console.error("Error deleting appointment slot:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Controller to fetch all appointment slots
const getAllAppointmentSlots = async (req, res) => {
  try {
    const slots = await sql`
      SELECT id, date, start_time, end_time, name,email,phone 
      FROM appointments 
      ORDER BY date ASC, start_time ASC
    `;

    res.status(200).json({
      success: true,
      message: "Appointment slots retrieved successfully",
      slots,
    });
  } catch (error) {
    console.error("Error fetching appointment slots:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createAppointmentSlot,getAvailableSlots,createAppointment,updateSlotStatus,getUserAppointments,cancelAppointment,deleteSlot,getAllAppointmentSlots
};
