import axiosInstance from "./api";

export const accountService = {
  // Test get accounts
  testGetAccounts: async () => {
    try {
      const response = await axiosInstance.get("/accounts");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get account by ID
  getAccountById: async (id: string) => {
    try {
      const response = await axiosInstance.get(`/accounts/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update account
  updateAccount: async (id: string, data: any) => {
    try {
      const response = await axiosInstance.put(`/accounts/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
