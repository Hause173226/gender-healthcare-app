import axiosInstance from "./api";
import {
  calculateCycleEvents,
  generateReminderDates,
} from "../utils/cycleCalculations";

// Interface dựa trên schema thực tế của reminder
export interface ReminderData {
  type: string; // "Pill", "Ovulation", "Event", "Period"...
  date: string;
  message?: string;
  isSent?: boolean;
  customerId: string;
}

export interface Reminder extends ReminderData {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export const reminderService = {
  // Tạo reminder mới
  createReminder: async (data: ReminderData) => {
    try {
      const response = await axiosInstance.post("/reminders", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Tạo reminders từ cycle data
  createRemindersFromCycle: async (cycleData: any) => {
    try {
      const cycleEvents = calculateCycleEvents(cycleData.periodDays);

      const reminderDates = generateReminderDates(cycleEvents);

      const createdReminders = [];

      for (const reminderData of reminderDates) {
        const reminder = await reminderService.createReminder({
          type: reminderData.type,
          date: reminderData.date.toISOString(),
          message: reminderData.message,
          customerId: cycleData.customerId,
        });
        createdReminders.push(reminder);
      }

      console.log("Created reminders:", createdReminders);
      return createdReminders;
    } catch (error) {
      console.error("Error creating reminders from cycle:", error);
      throw error;
    }
  },

  // Xóa tất cả reminders của một customer theo type
  deleteRemindersByType: async (customerId: string, type: string) => {
    try {
      const reminders = await reminderService.getRemindersByCustomer(
        customerId
      );
      const remindersToDelete = reminders.filter(
        (r: Reminder) => r.type === type
      );

      for (const reminder of remindersToDelete) {
        await reminderService.deleteReminder(reminder._id);
      }

      return {
        message: `Deleted ${remindersToDelete.length} reminders of type ${type}`,
      };
    } catch (error) {
      throw error;
    }
  },

  // Lấy reminders theo customer
  getRemindersByCustomer: async (customerId: string) => {
    try {
      const response = await axiosInstance.get(
        `/reminders/by-customer/${customerId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy reminder theo ID
  getReminderById: async (id: string) => {
    try {
      const response = await axiosInstance.get(`/reminders/by-id/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật reminder
  updateReminder: async (id: string, data: Partial<ReminderData>) => {
    try {
      const response = await axiosInstance.put(`/reminders/by-id/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Xóa reminder
  deleteReminder: async (id: string) => {
    try {
      const response = await axiosInstance.delete(`/reminders/by-id/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
