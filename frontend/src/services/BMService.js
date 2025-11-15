import api from './api.js'

const BMService = {

  async getBranchAssignment() {
    try {
      const response = await api.get('/branch-assignment')
      return response
    } catch (error) {
      throw error;
    }
  },

  async getOrders(branchId) {
    try {
      const response = await api.get('/ManageOrders', {
        params: { branch_id: branchId }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get Branch Dashboard Metrics
  async getMetrics(params) {
    try {
      const response = await api.get('/BMmetrics', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get stock list for branch
  async getStocks(branchId) {
    try {
      const response = await api.get('/ManageStock', {
        params: { branch_id: branchId }
      })
      return response
    } catch (error) {
      throw error
    }
  },

  // Update sizes for a shoe
  async updateStock(shoeId, payload) {
    try {
      const response = await api.put(`/ManageStock/${shoeId}`, payload)
      return response
    } catch (error) {
      throw error
    }
  }


}

export default BMService;
