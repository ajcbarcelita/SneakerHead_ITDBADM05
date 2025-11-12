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
            const response = await api.get('/getUsers');
            return response;
        } catch (error) {
            throw error;
        }
    },

    async getBranches() {
        try {
            const response = await api.get('/getBranches');
            return response;
        } catch (error) {
            throw error;
        }
    },
/*
    async updateUserRole(userId, newRoleId) {
        try {
            const response = await api.put(`/users/${userId}/role`, { roleId: newRoleId });
            return response;
        } catch (error) {
            throw error;
        }
    }
        */
}

export default SAService;
