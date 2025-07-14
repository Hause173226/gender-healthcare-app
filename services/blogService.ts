import axiosInstance from './api';

// Kiểu status blog
export type BlogStatus = 'deleted' | 'active';

// Counselor đã populate (nếu cần)
export interface PopulatedCounselor {
  _id: string;
  accountId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    image?: string;
  };
}

// Blog cơ bản dùng khi tạo mới
export interface BlogData {
  counselorId: string;
  title: string;
  content?: string;
  image?: string;
  author?: string;
  category?: string;
  status?: BlogStatus;
  postedDate?: Date;
  lastEdited?: Date;
}

// Blog đơn giản
export interface Blog extends BlogData {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

// ✅ Blog đã populate counselorId (KHÔNG extends Blog)
export interface BlogPopulated extends Omit<Blog, 'counselorId'> {
  counselorId: PopulatedCounselor;
}

export const blogService = {
  getAll: async (): Promise<BlogPopulated[]> => {
    const res = await axiosInstance.get('/blogs');
    return res.data;
  },

  getById: async (id: string): Promise<BlogPopulated> => {
    const res = await axiosInstance.get(`/blogs/${id}`);
    return res.data;
  },

  create: async (data: BlogData): Promise<Blog> => {
    const res = await axiosInstance.post('/blogs', data);
    return res.data;
  },

  update: async (id: string, data: Partial<BlogData>): Promise<Blog> => {
    const res = await axiosInstance.put(`/blogs/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const res = await axiosInstance.delete(`/blogs/${id}`);
    return res.data;
  },
};
