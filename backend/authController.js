const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

const JWT_SECRET = process.env.JWT_SECRET || "medicare_local_secret_key_2024";

exports.registerUser = async (req, res) => {
  try {
    const { name, firstName, lastName, email, password, role, dob, gender, specialization, licenseNumber, experience, consultationFee } = req.body;

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
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name: fallbackName,
      firstName: finalFirstName,
      lastName: finalLastName,
      email: normalizedEmail,
      password: hashedPassword,
      role: role || "patient",
      dob,
      gender,
      specialization,
      licenseNumber,
      experience,
      consultationFee,
      rating: role === 'doctor' ? 4.9 : undefined,
      hospital: role === 'doctor' ? "Medicare General Hospital" : undefined
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
        specialization: newUser.specialization,
        experience: newUser.experience,
        rating: newUser.rating,
        hospital: newUser.hospital,
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
    const user = await User.findOne({ email: normalizedEmail });

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
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

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

exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, dob, gender, specialization, licenseNumber, experience, consultationFee, hospital } = req.body;
    const userId = req.user.id;

    // Build update object based on allowed fields sent in request
    const updateData = {};
    if (firstName) { updateData.firstName = firstName; updateData.name = `${firstName} ${lastName || ""}`.trim(); }
    if (lastName) updateData.lastName = lastName;
    // Update name explicitly if both changed
    if (firstName && lastName) updateData.name = `${firstName} ${lastName}`;

    if (email) {
      // Check if email already exists for another user
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing && existing._id.toString() !== userId.toString()) {
        return res.status(400).json({ message: "Email is already taken" });
      }
      updateData.email = email.toLowerCase();
    }

    // Additional fields
    if (phone !== undefined) updateData.phone = phone;
    if (dob !== undefined) updateData.dob = dob;
    if (gender !== undefined) updateData.gender = gender;
    if (specialization !== undefined) updateData.specialization = specialization;
    if (licenseNumber !== undefined) updateData.licenseNumber = licenseNumber;
    if (experience !== undefined) updateData.experience = experience;
    if (consultationFee !== undefined) updateData.consultationFee = consultationFee;
    if (hospital !== undefined) updateData.hospital = hospital;

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
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
        phone: user.phone,
        dob: user.dob,
        gender: user.gender,
        licenseNumber: user.licenseNumber,
        consultationFee: user.consultationFee
      }
    });

  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: error.message || "Failed to update profile" });
  }
};
