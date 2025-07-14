import axiosInstance from "./api";

// Interface schedule
export interface ConsultationSchedule {
  _id: string;
  counselorId: {
    _id: string;
    accountId: {
      _id: string;
      name: string;
      email: string;
      phone?: string;
      image?: string;
    };
    degree?: string;
    experience?: number;
    bio?: string;
  };
  startTime: string;
  endTime: string;
  status: 'available' | 'booked' | 'completed' | 'cancelled';
  note?: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export const consultationScheduleService = {
  getAvailableCounselorsBySlot: async (date: string, startTime: string, endTime: string) => {
    const response = await axiosInstance.get('/schedules/available-counselors', {
      params: { date, startTime, endTime },
    });
    return response.data;
  },

getSchedulesByCounselorAndDate: async (counselorId: string, date: string) => {
  const response = await axiosInstance.get('/schedules/filter', {
    params: { counselorId, date },
  });
  return response.data;
},


  getSchedulesByCounselorAccount: async (accountId: string) => {
    const response = await axiosInstance.get(`/schedules/by-account/${accountId}`);
    return response.data;
  },

  // ✅ thêm hàm này vào
  updateSchedule: async (scheduleId: string, data: Partial<{ status: string }>) => {
    const res = await axiosInstance.put(`/schedules/${scheduleId}`, data);
    return res.data;
  },
};

