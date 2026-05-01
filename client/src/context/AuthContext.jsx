import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'medicare_token';
const USER_KEY = 'medicare_user';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
    });
    const [loading, setLoading] = useState(false);

    // On mount, verify the stored token is still valid
    useEffect(() => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token || user) return;

        authAPI.verifyToken()
            .then(res => setUser(res.data.user))
            .catch(() => {
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(USER_KEY);
                setUser(null);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const login = useCallback(async (email, password /*, role param ignored – backend decides */) => {
        setLoading(true);
        try {
            const res = await authAPI.login(email, password);
            const { token, user: userData } = res.data;
            localStorage.setItem(TOKEN_KEY, token);
            localStorage.setItem(USER_KEY, JSON.stringify(userData));
            setUser(userData);
            return { success: true, user: userData };
        } catch (err) {
            const message = err.response?.data?.message || 'Login failed. Please try again.';
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, []);

    const register = useCallback(async (data) => {
        setLoading(true);
        try {
            const res = await authAPI.register(data);
            const { token, user: userData } = res.data;
            localStorage.setItem(TOKEN_KEY, token);
            localStorage.setItem(USER_KEY, JSON.stringify(userData));
            setUser(userData);
            return { success: true, user: userData };
        } catch (err) {
            const message = err.response?.data?.message || 'Registration failed. Please try again.';
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, []);

    const oauthLogin = useCallback(async (data) => {
        setLoading(true);
        try {
            const res = await authAPI.oauthLogin(data);
            const { token, user: userData } = res.data;
            localStorage.setItem(TOKEN_KEY, token);
            localStorage.setItem(USER_KEY, JSON.stringify(userData));
            setUser(userData);
            return { success: true, user: userData };
        } catch (err) {
            const message = err.response?.data?.message || 'OAuth Login failed. Please try again.';
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateUser = useCallback((updatedUser) => {
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        setUser(updatedUser);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, register, oauthLogin, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
