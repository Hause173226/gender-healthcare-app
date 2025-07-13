import axiosInstance from "./api";

// ✅ Tạo kiểu BookingStatus riêng
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "missed";

// Gốc dữ liệu booking để gửi lên
export interface ConsultationBookingData {
  note?: string;
  rating?: number;
  feedback?: string;
  status?: BookingStatus;
  result?: string;
  bookingDate: Date;
  customerId: string;
  scheduleId: string;
}

// Booking đơn giản (chưa populate)
export interface ConsultationBooking extends ConsultationBookingData {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

// ✨ Các kiểu dữ liệu khi đã populate
export interface PopulatedCustomer {
  _id: string;
  accountId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface PopulatedCounselor {
  _id: string;
  accountId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface PopulatedSchedule {
  _id: string;
  counselorId: PopulatedCounselor;
  startTime: string;
  endTime: string;
  status: "available" | "booked" | "completed" | "cancelled";
  price: number;
}

// Booking đã populate đầy đủ
export interface ConsultationBookingPopulated {
  _id: string;
  bookingDate: string;
  status: BookingStatus;
  customerId: PopulatedCustomer;
  scheduleId: PopulatedSchedule;
  createdAt: string;
  updatedAt: string;
  note?: string;
  rating?: number;
  feedback?: string;
  result?: string;
}

export const consultationBookingService = {
  createBooking: async (
    data: ConsultationBookingData
  ): Promise<ConsultationBooking> => {
    const res = await axiosInstance.post("/consultationbooking", data);
    return res.data;
  },

 getBookingsByCustomer: async (accountId: string): Promise<ConsultationBookingPopulated[]> => {
  const res = await axiosInstance.get(`/consultationbooking/customer/${accountId}`);
  return res.data;
},

  getBookingById: async (
    id: string
  ): Promise<ConsultationBookingPopulated> => {
    const res = await axiosInstance.get(`/consultationbooking/${id}`);
    return res.data;
  },

  updateBooking: async (
    id: string,
    data: Partial<ConsultationBookingData>
  ): Promise<ConsultationBookingPopulated> => {
    const res = await axiosInstance.put(`/consultationbooking/${id}`, data);
    return res.data;
  },

  deleteBooking: async (id: string): Promise<{ message: string }> => {
    const res = await axiosInstance.delete(`/consultationbooking/${id}`);
    return res.data;
  },

  getCustomerByAccountId: async (
    accountId: string
  ): Promise<PopulatedCustomer> => {
    const res = await axiosInstance.get(
      `/consultationbooking/customers/byAccount/${accountId}`
    );
    return res.data;
  },
};
