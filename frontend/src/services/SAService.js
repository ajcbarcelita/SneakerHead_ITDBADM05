import api from './api.js';

const SAService = {
    async getMetrics(period, branch) {
        try {
            const response = await api.get('/metrics', { 
                params: { period, branch }
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    async getUsers() {
        try {
            const response = await api.get('/users');
            return response;
        } catch (error) {
            throw error;
        }
    },

    async getBranches() {
        try {
            const response = await api.get('/branches');
            return response;
        } catch (error) {
            throw error;
        }
    },

    async addBranch(branchData) {
        try {
            const response = await api.post('/branches', branchData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    async updateBranch(branchId, branchData) {
        try {
            const response = await api.put(`/branches/${branchId}`, branchData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    async getCities() {
        try {
            const response = await api.get('/cities');
            return response
        } catch (error) {
            throw error;
        }
    },

    async updateUser(userId, userData) {
        try {
            const response = await api.put(`/users/${userId}`, userData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    async addUser(userData) {
        try {
            const response = await api.post('/users', userData);
            return response;
        } catch (error) {
            throw error;
        }
    },
}

export default SAService;