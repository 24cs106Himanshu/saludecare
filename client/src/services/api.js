import axios from 'axios';

// ─── BASE CONFIGURATION ──────────────────────────────────────────────────
// Use localhost in development, production backend when deployed
const isLocalDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const baseURL = isLocalDev ? 'http://localhost:5000/api' : (import.meta.env.VITE_API_URL || 'https://saludecare.onrender.com/api');

const api = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
});


// Special Chatbot Axios instance. 
// Uses local backend during their presentation testing so the new AI code runs.
// Will smoothly switch back to the main backend when deployed by the friend.
const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const chatbotBaseURL = isLocalhost ? 'http://localhost:5000/api' : (import.meta.env.VITE_API_URL || 'https://saludecare.onrender.com/api');

const chatbotAxios = axios.create({
    baseURL: chatbotBaseURL,
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request for main API
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('medicare_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Attach JWT token for Chatbot API 
chatbotAxios.interceptors.request.use((config) => {
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

    oauthLogin: (data) =>
        api.post('/auth/oauth', data),

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

    updateAvailability: (id, blockedSlots) =>
        api.put(`/doctors/${id}/availability`, { blockedSlots }),
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
    sendMessage: (message) =>
        chatbotAxios.post('/chatbot/message', { message }),

    getHistory: () =>
        chatbotAxios.get('/chatbot/history'),

    clearHistory: () =>
        chatbotAxios.delete('/chatbot/history'),
};

export default api;
