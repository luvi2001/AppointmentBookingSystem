require("dotenv").config();
const express = require("express");
const cors = require("cors"); // Import CORS package
const { neon } = require("@neondatabase/serverless");
const AuthRoutes = require("./routes/authRoutes");
const AppointmentRoutes=require("./routes/appointmentRoutes");


// Initialize NeonDB client
const sql = neon(process.env.DATABASE_URL);

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Enable CORS for all routes (this allows all origins to make requests)
app.use(cors());

// Simple route to check PostgreSQL version (can be removed later)
app.get("/", async (req, res) => {
  try {
    // Perform a simple query to get the PostgreSQL version
    const result = await sql`SELECT version()`;
    const { version } = result[0]; // Extract the version from the first row
    res.status(200).send(version);
  } catch (error) {
    // Handle any errors from the database query
    console.error("Error executing query:", error);
    res.status(500).send("Error connecting to the database");
  }
});

// Check database connection and log success (using async/await)
const checkDbConnection = async () => {
  try {
    await sql`SELECT 1`;  // This checks the connection
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};

// Call the checkDbConnection function before starting the server
checkDbConnection();

// Use Auth Routes for sign-up and other auth-related routes
app.use("/api/auth", AuthRoutes);
app.use("/api/appointments", AppointmentRoutes);

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
