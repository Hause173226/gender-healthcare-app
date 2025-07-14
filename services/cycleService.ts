import axiosInstance from "./api";

// Interface dựa trên schema thực tế của cycle
export interface CycleData {
  periodDays: string[];
  customerId: string;
  fertileWindow?: string[];
  ovulationDate?: string;
  symptoms?: string[];
  notes?: string;
}

export interface Cycle extends CycleData {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export const cycleService = {
  // Tạo cycle mới
  createCycle: async (data: CycleData) => {
    try {
      const response = await axiosInstance.post("/cycles", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy cycles theo customer
  getCyclesByCustomer: async (customerId: string) => {
    try {
      const response = await axiosInstance.get(
        `/cycles/by-customer/${customerId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy cycle theo ID
  getCycleById: async (id: string) => {
    try {
      const response = await axiosInstance.get(`/cycles/by-id/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật cycle
  updateCycle: async (id: string, data: Partial<CycleData>) => {
    try {
      const response = await axiosInstance.put(`/cycles/by-id/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Xóa cycle
  deleteCycle: async (id: string) => {
    try {
      const response = await axiosInstance.delete(`/cycles/by-id/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
