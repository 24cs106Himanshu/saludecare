const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { db } = require("./localDb");

const JWT_SECRET = process.env.JWT_SECRET || "medicare_local_secret_key_2024";

exports.registerUser = async (req, res) => {
  try {
    const { name, firstName, lastName, email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const derivedName = name || `${firstName || ""} ${lastName || ""}`.trim();
    const fallbackName = derivedName || (email ? email.split("@")[0] : "");

    if (!fallbackName) {
      return res.status(400).json({ message: "Name is required" });
    }

    let finalFirstName = firstName;
    let finalLastName = lastName;

    if (!finalFirstName && !finalLastName) {
      const nameParts = fallbackName.split(" ");
      finalFirstName = nameParts[0] || fallbackName;
      finalLastName = nameParts.slice(1).join(" ") || "";
    }

    const normalizedEmail = email.toLowerCase();

    // Check if user exists
    const userExists = db.findUserByEmail(normalizedEmail);
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `user_${Date.now()}`;

    const newUser = db.createUser({
      _id: userId,
      id: userId,
      name: fallbackName,
      firstName: finalFirstName,
      lastName: finalLastName,
      email: normalizedEmail,
      password: hashedPassword,
      role: role || "patient",
    });

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: error.message || "Registration failed" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase();
    const user = db.findUserByEmail(normalizedEmail);

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    const nameParts = user.name.split(" ");
    const firstName = user.firstName || nameParts[0] || user.name;
    const lastName = user.lastName || nameParts.slice(1).join(" ") || "";

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        firstName,
        lastName,
        email: user.email,
        role: user.role,
        specialization: user.specialization,
        experience: user.experience,
        rating: user.rating,
        hospital: user.hospital,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    const user = db.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...userWithoutPassword } = user;

    res.json({
      user: {
        id: user._id,
        name: user.name,
        firstName: user.firstName || user.name.split(" ")[0],
        lastName: user.lastName || user.name.split(" ").slice(1).join(" "),
        email: user.email,
        role: user.role,
        specialization: user.specialization,
        experience: user.experience,
        rating: user.rating,
        hospital: user.hospital,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
