import axiosInstance from "./api";
import { reminderService } from "./reminderService";

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
  // Tạo cycle mới và tự động tạo reminders
  createCycle: async (data: CycleData) => {
    try {
      const response = await axiosInstance.post("/cycles", data);
      const cycle = response.data;

      // Tự động tạo reminders cho cycle này
      const reminders = await reminderService.createRemindersFromCycle(cycle);

      return { cycle, reminders };
    } catch (error) {
      console.error("Error creating cycle:", error);
      throw error;
    }
  },

  // Cập nhật cycle và cập nhật lại reminders
  updateCycle: async (id: string, data: Partial<CycleData>) => {
    try {
      const response = await axiosInstance.put(`/cycles/by-id/${id}`, data);
      const updatedCycle = response.data;

      // Chỉ cập nhật reminders nếu thay đổi periodDays
      if (data.periodDays) {
        console.log("Updating reminders for cycle:", updatedCycle);

        // Xóa reminders cũ
        await Promise.all([
          reminderService.deleteRemindersByType(
            updatedCycle.customerId,
            "Period"
          ),
          reminderService.deleteRemindersByType(
            updatedCycle.customerId,
            "Ovulation"
          ),
          reminderService.deleteRemindersByType(
            updatedCycle.customerId,
            "Pill"
          ),
        ]);

        // Tạo reminders mới
        const reminders = await reminderService.createRemindersFromCycle(
          updatedCycle
        );
        console.log("Updated reminders:", reminders);

        return { cycle: updatedCycle, reminders };
      }

      return { cycle: updatedCycle, reminders: [] };
    } catch (error) {
      console.error("Error updating cycle:", error);
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

  // Xóa cycle và các reminders liên quan
  deleteCycle: async (id: string) => {
    try {
      const cycle = await cycleService.getCycleById(id);

      // Xóa tất cả reminders liên quan
      await reminderService.deleteRemindersByType(cycle.customerId, "Period");
      await reminderService.deleteRemindersByType(
        cycle.customerId,
        "Ovulation"
      );
      await reminderService.deleteRemindersByType(cycle.customerId, "Pill");

      // Xóa cycle
      const response = await axiosInstance.delete(`/cycles/by-id/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
