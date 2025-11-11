import api from './api.js'

const BMService = {
  async getOrders(branchId) {
    try {
      const response = await api.get('/ManageOrders', {
        params: { branch_id: branchId } 
      });
      return response; 
    } catch (error) {
      throw error;
    }
  }
}
export default BMService;
