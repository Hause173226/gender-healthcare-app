import axiosInstance from "./api";

// Interface dựa trên schema Counselor
export interface Counselor {
  _id: string;

  degree?: string;
  experience?: number;
  bio?: string;
  accountId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    image?: string;
    gender?: 'Male' | 'Female' | 'Other';
    createdAt: string;
    updatedAt: string;
  };

  createdAt: string;
  updatedAt: string;
}

export const counselorService = {
  // Lấy tất cả tư vấn viên
  getAll: async (): Promise<Counselor[]> => {
    const res = await axiosInstance.get("/counselors");
    return res.data;
  },

  // Lấy theo ID
  getById: async (id: string): Promise<Counselor> => {
    const res = await axiosInstance.get(`/counselors/${id}`);
    return res.data;
  },

  // Lấy theo accountId
  getByAccountId: async (accountId: string): Promise<Counselor> => {
    const res = await axiosInstance.get(`/counselors/by-account/${accountId}`);
    return res.data;
  }
};
