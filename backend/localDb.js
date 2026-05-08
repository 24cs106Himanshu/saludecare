const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const DB_FILE = path.join(__dirname, "localDatabase.json");

// Default seeded data
const DEFAULT_DB = {
    users: [],
    appointments: [],
    prescriptions: [],
    records: [],
};

// Load DB from file
function loadDB() {
    try {
        if (fs.existsSync(DB_FILE)) {
            const raw = fs.readFileSync(DB_FILE, "utf-8");
            return JSON.parse(raw);
        }
    } catch (e) {
        console.error("Error reading local DB:", e.message);
    }
    return { ...DEFAULT_DB, users: [], appointments: [], prescriptions: [], records: [] };
}

// Save DB to file
function saveDB(db) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
    } catch (e) {
        console.error("Error saving local DB:", e.message);
    }
}

// Seed default accounts if not present
async function seedDefaultAccounts() {
    const db = loadDB();

    const patientExists = db.users.find((u) => u.email === "patient@medicare.com");
    const doctorExists = db.users.find((u) => u.email === "doctor@medicare.com");

    let changed = false;

    if (!patientExists) {
        const hashedPwd = await bcrypt.hash("patient123", 10);
        db.users.push({
            _id: "patient_001",
            id: "patient_001",
            name: "John Patient",
            firstName: "John",
            lastName: "Patient",
            email: "patient@medicare.com",
            password: hashedPwd,
            role: "patient",
            createdAt: new Date().toISOString(),
        });
        changed = true;
        console.log("✅ Seeded patient account: patient@medicare.com / patient123");
    }

    if (!doctorExists) {
        const hashedPwd = await bcrypt.hash("doctor123", 10);
        db.users.push({
            _id: "doctor_001",
            id: "doctor_001",
            name: "Dr. Sarah Johnson",
            firstName: "Dr. Sarah",
            lastName: "Johnson",
            email: "doctor@medicare.com",
            password: hashedPwd,
            role: "doctor",
            specialization: "Cardiology",
            experience: "8 years",
            rating: 4.9,
            hospital: "Medicare General Hospital",
            createdAt: new Date().toISOString(),
        });
        changed = true;
        console.log("✅ Seeded doctor account: doctor@medicare.com / doctor123");
    }

    if (changed) {
        saveDB(db);
    }
}

// ─── CRUD Helpers ────────────────────────────────────────────────────────────

const db = {
    // USERS
    findUserByEmail(email) {
        const data = loadDB();
        return data.users.find((u) => u.email === email.toLowerCase()) || null;
    },
    findUserById(id) {
        const data = loadDB();
        return data.users.find((u) => u._id === id || u.id === id) || null;
    },
    createUser(userData) {
        const data = loadDB();
        const newUser = { ...userData, _id: userData._id || Date.now().toString(), createdAt: new Date().toISOString() };
        data.users.push(newUser);
        saveDB(data);
        return newUser;
    },
    getAllUsers() {
        return loadDB().users;
    },

    // APPOINTMENTS
    getAppointments(filter = {}) {
        const data = loadDB();
        let apts = data.appointments;
        if (filter.patientId) apts = apts.filter((a) => a.patientId === filter.patientId);
        if (filter.doctorId) apts = apts.filter((a) => a.doctorId === filter.doctorId);
        if (filter.userId) apts = apts.filter((a) => a.patientId === filter.userId || a.doctorId === filter.userId);
        return apts;
    },
    getAppointmentById(id) {
        const data = loadDB();
        return data.appointments.find((a) => a.id === id || a._id === id) || null;
    },
    createAppointment(apptData) {
        const data = loadDB();
        const newAppt = { ...apptData, id: Date.now().toString(), createdAt: new Date().toISOString() };
        data.appointments.push(newAppt);
        saveDB(data);
        return newAppt;
    },
    updateAppointment(id, updates) {
        const data = loadDB();
        const idx = data.appointments.findIndex((a) => a.id === id || a._id === id);
        if (idx === -1) return null;
        data.appointments[idx] = { ...data.appointments[idx], ...updates };
        saveDB(data);
        return data.appointments[idx];
    },
    deleteAppointment(id) {
        const data = loadDB();
        const idx = data.appointments.findIndex((a) => a.id === id || a._id === id);
        if (idx === -1) return false;
        data.appointments.splice(idx, 1);
        saveDB(data);
        return true;
    },

    // PRESCRIPTIONS
    getPrescriptions(filter = {}) {
        const data = loadDB();
        let rxs = data.prescriptions;
        if (filter.patientId) rxs = rxs.filter((r) => r.patientId === filter.patientId);
        if (filter.doctorId) rxs = rxs.filter((r) => r.doctorId === filter.doctorId);
        if (filter.userId) rxs = rxs.filter((r) => r.patientId === filter.userId || r.doctorId === filter.userId);
        return rxs;
    },
    createPrescription(data_input) {
        const data = loadDB();
        const newRx = { ...data_input, id: Date.now().toString(), createdAt: new Date().toISOString() };
        data.prescriptions.push(newRx);
        saveDB(data);
        return newRx;
    },
    updatePrescription(id, updates) {
        const data = loadDB();
        const idx = data.prescriptions.findIndex((r) => r.id === id || r._id === id);
        if (idx === -1) return null;
        data.prescriptions[idx] = { ...data.prescriptions[idx], ...updates };
        saveDB(data);
        return data.prescriptions[idx];
    },

    // RECORDS
    getRecords(filter = {}) {
        const data = loadDB();
        let recs = data.records;
        if (filter.patientId) recs = recs.filter((r) => r.patientId === filter.patientId);
        if (filter.userId) recs = recs.filter((r) => r.patientId === filter.userId);
        return recs;
    },
    createRecord(data_input) {
        const data = loadDB();
        const newRec = { ...data_input, id: Date.now().toString(), createdAt: new Date().toISOString() };
        data.records.push(newRec);
        saveDB(data);
        return newRec;
    },

    // STATS
    getStats(userId, role) {
        const data = loadDB();
        if (role === "patient") {
            const myAppts = data.appointments.filter((a) => a.patientId === userId);
            const myRx = data.prescriptions.filter((r) => r.patientId === userId);
            const myRecs = data.records.filter((r) => r.patientId === userId);
            const upcoming = myAppts.filter((a) => a.status !== "completed" && a.status !== "cancelled");
            return {
                totalAppointments: myAppts.length,
                upcomingAppointments: upcoming.length,
                activePrescriptions: myRx.filter((r) => r.status === "Active" || r.status === "active").length,
                medicalRecords: myRecs.length,
            };
        } else if (role === "doctor") {
            const myAppts = data.appointments.filter((a) => a.doctorId === userId);
            const today = new Date().toISOString().split("T")[0];
            const todayAppts = myAppts.filter((a) => a.date === today);
            const uniquePatients = [...new Set(myAppts.map((a) => a.patientId))];
            return {
                totalPatients: uniquePatients.length,
                todayAppointments: todayAppts.length,
                totalAppointments: myAppts.length,
                activePrescriptions: data.prescriptions.filter((r) => r.doctorId === userId).length,
            };
        } else {
            const doctors = data.users.filter((u) => u.role === "doctor");
            const patients = data.users.filter((u) => u.role === "patient");
            const today = new Date().toISOString().split("T")[0];
            return {
                totalUsers: data.users.length,
                totalDoctors: doctors.length,
                totalPatients: patients.length,
                todayAppointments: data.appointments.filter((a) => a.date === today).length,
            };
        }
    },
};

module.exports = { db, saveDB, loadDB, seedDefaultAccounts };
