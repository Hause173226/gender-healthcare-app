import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import {
  accountService,
  Account,
  LoginCredentials,
  AccountData,
} from "@/services/accountService";

interface AuthContextType {
  user: Account | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: AccountData) => Promise<void>;
  logout: () => Promise<void>;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userData = await AsyncStorage.getItem("user");

      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      await AsyncStorage.multiRemove(["token", "user"]);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await accountService.login(credentials);

      if (response.success) {
        await AsyncStorage.setItem("token", response.token);
        await AsyncStorage.setItem("user", JSON.stringify(response.user));

        setUser(response.user);
        console.log("🧑‍💼 Logged in user role:", response.user.role);

        Toast.show({
          type: "success",
          text1: `Welcome ${response.user.name}!`,
          position: "top",
        });
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";
      Toast.show({
        type: "error",
        text1: errorMessage,
        position: "top",
      });
      throw error;
    }
  };

  const register = async (data: AccountData) => {
    try {
      const response = await accountService.register(data);

      if (response.success) {
        Toast.show({
          type: "success",
          text1: "Registration successful! Please login.",
          position: "top",
        });
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Registration failed";
      Toast.show({
        type: "error",
        text1: errorMessage,
        position: "top",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(["token", "user"]);
      setUser(null);
      Toast.show({
        type: "success",
        text1: "Logged out successfully!",
        position: "top",
      });
    } catch (error) {
      console.error("Logout error:", error);
      Toast.show({
        type: "error",
        text1: "An error occurred during logout",
        position: "top",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isLoggedIn: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
