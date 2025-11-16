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

    async getPromoCodes() {
        try {
            const response = await api.get('/promo-codes');
            return response;
        } catch (error) {
            throw error;
        }
    },

    async addPromoCode(promoData) {
        try {
            const response = await api.post('/promo-codes', promoData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    async updatePromoCode(promoCode, updateData) {
        try {
            const response = await api.put(`/promo-codes/${promoCode}`, updateData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    async getShoes() {
        try {
            const response = await api.get('/shoes');
            return response;
        } catch (error) {
            throw error;
        }
    },

    async addShoe(shoeData) {
        try {
            const response = await api.post('/shoes', shoeData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    async updateShoe(shoeId, updateData) {
        try {
            const response = await api.put(`/shoes/${shoeId}`, updateData);
            return response;
        } catch (error) {
            throw error;
        }
    },

    async getBrands() {
        try {
            const response = await api.get('/brands');
            return response;
        } catch (error) {
            throw error;
        }
    },

    async getLogs() {
        try {
            const response = await api.get('/logs');
            return response;
        } catch (error) {
            throw error;
        }
    }
}

export default SAService;