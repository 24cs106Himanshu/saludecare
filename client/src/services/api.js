import axios from 'axios';

// Base API instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('medicare_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ─── AUTH ──────────────────────────────────────────────────────────────────

export const authAPI = {
    login: (email, password) =>
        api.post('/auth/login', { email, password }),

    register: (data) =>
        api.post('/auth/register', data),

    verifyToken: () =>
        api.get('/auth/verify'),

    updateProfile: (data) =>
        api.put('/auth/profile', data),
};

// ─── APPOINTMENTS ───────────────────────────────────────────────────────────

export const appointmentsAPI = {
    getAll: () =>
        api.get('/appointments'),

    create: (data) =>
        api.post('/appointments', data),

    cancel: (id) =>
        api.delete(`/appointments/${id}`),

    update: (id, data) =>
        api.put(`/appointments/${id}`, data),

    reschedule: (id, data) =>
        api.put(`/appointments/${id}/reschedule`, data),
};

// ─── PRESCRIPTIONS ──────────────────────────────────────────────────────────

export const prescriptionsAPI = {
    getAll: () =>
        api.get('/prescriptions'),

    create: (data) =>
        api.post('/prescriptions', data),

    update: (id, data) =>
        api.put(`/prescriptions/${id}`, data),

    getByPatient: (patientId) =>
        api.get(`/prescriptions/patient/${patientId}`),

    getByDoctor: (doctorId) =>
        api.get(`/prescriptions/doctor/${doctorId}`),
};

// ─── MEDICAL RECORDS ────────────────────────────────────────────────────────

export const recordsAPI = {
    getAll: () =>
        api.get('/records'),

    create: (data) =>
        api.post('/records', data),

    update: (id, data) =>
        api.put(`/records/${id}`, data),

    getByPatient: (patientId) =>
        api.get(`/records/patient/${patientId}`),
};

// ─── DOCTORS ────────────────────────────────────────────────────────────────

export const doctorsAPI = {
    getAll: () =>
        api.get('/doctors'),

    getById: (id) =>
        api.get(`/doctors/${id}`),

    getAvailability: (id) =>
        api.get(`/doctors/${id}/availability`),
};

// ─── PATIENTS ───────────────────────────────────────────────────────────────

export const patientsAPI = {
    getAll: () =>
        api.get('/patients'),

    getById: (id) =>
        api.get(`/patients/${id}`),
};

// ─── DASHBOARD ──────────────────────────────────────────────────────────────

export const dashboardAPI = {
    getStats: () =>
        api.get('/dashboard/stats'),
};

// ─── CHATBOT ────────────────────────────────────────────────────────────────

export const chatbotAPI = {
    send: (message) =>
        api.post('/chatbot', { message }),
};

export default api;
