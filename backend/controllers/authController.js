const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { neon } = require("@neondatabase/serverless");

// Initialize NeonDB client
const sql = neon(process.env.DATABASE_URL);

// Secret for JWT (store in environment variables in production)
const JWT_SECRET = process.env.JWT_SECRET;

// Sign-Up Controller: Handles user registration
const signUp = async (req, res) => {
    const { name, email, nic, phone, password } = req.body;
  
      
    // Validate the required fields
    if (!name || !email || !nic || !phone || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }
  
    try {
      // Check if email already exists
      const existingEmail = await sql`
        SELECT * FROM users WHERE email = ${email}
      `;
  
      if (existingEmail.length > 0) {
        return res.status(400).json({ message: "Email already exists" });
      }
  
      // Check if NIC already exists
      const existingNic = await sql`
        SELECT * FROM users WHERE nic = ${nic}
      `;
  
      if (existingNic.length > 0) {
        return res.status(400).json({ message: "NIC already exists" });
      }
  
      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds
  
      // Insert the new user into the users table
      const result = await sql`
        INSERT INTO users (name, email, nic, phone, password)
        VALUES (${name}, ${email}, ${nic}, ${phone}, ${hashedPassword})
        RETURNING id, name, email, nic, phone, created_at
      `;
  
      // Generate JWT token
      const user = result[0];
      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email, phone: user.phone,nic: user.nic, },
        JWT_SECRET,
        { expiresIn: "1h" } // Token expires in 1 hour
      );
  
      // Return success response with the created user and JWT token
      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          nic: user.nic,
          phone: user.phone,
        },
        token, // Sending the JWT token to the client
      });
    } catch (error) {
      console.error("Error during sign-up:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

// Login Controller: Handles user login
const login = async (req, res) => {
    const { email, password } = req.body;
    
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }
  
    try {
      // Get the user from the database by email
      const result = await sql`
        SELECT * FROM users WHERE email = ${email}
      `;
  
      if (result.length === 0) {
        return res.status(400).json({ message: "Invalid email or password." });
      }
  
      const user = result[0];
  
      // Compare the hashed password with the entered password
      const match = await bcrypt.compare(password, user.password);
  
      if (!match) {
        return res.status(400).json({ message: "Invalid email or password." });
      }
  
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email,phone:user.phone,nic: user.nic, },
        JWT_SECRET,
        { expiresIn: "1h" } // Token expires in 1 hour
      );
  
      // Successful login, send the token and user data
      res.status(200).json({
        message: "Login successful",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          nic: user.nic,
          phone: user.phone,
        },
        token, // Sending the JWT token to the client
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  
  

module.exports = { signUp,login };
