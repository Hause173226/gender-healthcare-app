import axiosInstance from "./api";

// Account Interface based on MongoDB schema
export interface AccountData {
  name: string;
  image?: string;
  gender?: "Male" | "Female" | "Other";
  email: string;
  phone?: string;
  password: string;
  role: "Customer"; // Giới hạn role chỉ cho Customer
  isVerified?: boolean;
  isActive?: boolean;
}

export interface Account extends Omit<AccountData, "password"> {
  _id: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Backend response format
export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: Account; // Backend trả về "user" không phải "account"
}

export const accountService = {
  // Authentication
  register: async (data: AccountData) => {
    try {
      const customerData = { ...data, role: "Customer" };
      const response = await axiosInstance.post(
        "/accounts/register",
        customerData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  login: async (credentials: LoginCredentials) => {
    try {
      const response = await axiosInstance.post<AuthResponse>(
        "/accounts/login",
        credentials
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  checkEmail: async (email: string) => {
    try {
      const response = await axiosInstance.post("/accounts/check-email", {
        email,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await axiosInstance.get("/accounts/me");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (
    id: string,
    data: Partial<Omit<AccountData, "role" | "password">>
  ) => {
    try {
      const response = await axiosInstance.put(`/accounts/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  changePassword: async (
    id: string,
    oldPassword: string,
    newPassword: string
  ) => {
    try {
      const response = await axiosInstance.put(`/accounts/${id}/password`, {
        oldPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAccountById: async (id: string) => {
    try {
      const response = await axiosInstance.get(`/accounts/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
