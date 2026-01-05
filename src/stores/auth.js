import { defineStore } from 'pinia';
import apiClient from '../api/client';

export const useAuthStore = defineStore('auth', {
    state: () => {
        const storedUser = localStorage.getItem('user');
        let user = null;
        try {
            user = storedUser && storedUser !== 'undefined' ? JSON.parse(storedUser) : null;
        } catch (e) {
            console.error('Failed to parse user from localStorage', e);
        }

        return {
            user,
            token: localStorage.getItem('token') || null,
        };
    },
    getters: {
        isAuthenticated: (state) => !!state.token,
    },
    actions: {
        async login(email, password) {
            try {
                const response = await apiClient.post('/auth/login', { email, password });
                this.token = response.data.token;
                this.user = response.data.user;
                localStorage.setItem('token', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));
                return response.data;
            } catch (error) {
                throw error;
            }
        },
        async register(email, password, userName, confirmPassword) {
            try {
                const response = await apiClient.post('/auth/register', { email, password, userName, confirmPassword });
                this.token = response.data.token;
                this.user = response.data.user;
                localStorage.setItem('token', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));
                return response.data;
            } catch (error) {
                throw error;
            }
        },
        logout() {
            this.token = null;
            this.user = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
    },
});
