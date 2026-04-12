import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { getApiDebugInfo } from "../api/config";

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (email, password) => {
    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();
    const rawPassword = String(password || "");

    const passwordCandidates = [rawPassword];
    const trimmedPassword = rawPassword.trim();
    if (trimmedPassword && trimmedPassword !== rawPassword) {
      passwordCandidates.push(trimmedPassword);
    }

    try {
      for (const currentPassword of passwordCandidates) {
        try {
          const payload = {
            email: normalizedEmail,
            password: currentPassword,
          };
          const { data } = await api.post("/auth/login", payload);

          if (data?.requiresTwoFactor) {
            return data;
          }

          setUser(data);
          setUserToken(data.token);
          await AsyncStorage.setItem("userToken", data.token);
          await AsyncStorage.setItem("userInfo", JSON.stringify(data));
          return data;
        } catch (error) {
          if (error?.response?.status === 401) {
            continue;
          }
          throw error;
        }
      }

      throw new Error(
        "Invalid email or password. Check that email is correct and remove extra spaces in password.",
      );
    } catch (error) {
      if (!error?.response) {
        throw "Unable to reach server. Make sure backend is running on port 5000 and mobile can access it.";
      }
      throw error.response?.data?.message || error.message || "Login failed";
    }
  };

  const verifyLoginTwoFactorOtp = async (twoFactorSessionId, otp) => {
    try {
      const payload = {
        twoFactorSessionId: String(twoFactorSessionId || "").trim(),
        otp: String(otp || "").trim(),
      };

      const { data } = await api.post("/auth/login/2fa/verify", payload);
      setUser(data);
      setUserToken(data.token);
      await AsyncStorage.setItem("userToken", data.token);
      await AsyncStorage.setItem("userInfo", JSON.stringify(data));
      return data;
    } catch (error) {
      throw error?.response?.data?.message || "OTP verification failed";
    }
  };

  const resendLoginTwoFactorOtp = async (twoFactorSessionId) => {
    try {
      const payload = {
        twoFactorSessionId: String(twoFactorSessionId || "").trim(),
      };

      const { data } = await api.post("/auth/login/2fa/resend", payload);
      return data;
    } catch (error) {
      throw error?.response?.data?.message || "Failed to resend OTP";
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const payload = {
        name: String(name || "").trim(),
        email: String(email || "")
          .trim()
          .toLowerCase(),
        password: String(password || ""),
        role,
      };
      const { data } = await api.post("/auth/register", payload);
      setUser(data);
      setUserToken(data.token);
      await AsyncStorage.setItem("userToken", data.token);
      await AsyncStorage.setItem("userInfo", JSON.stringify(data));
      return data;
    } catch (error) {
      throw error.response?.data?.message || "Registration failed";
    }
  };

  const sendRegisterOtp = async (email) => {
    try {
      const payload = {
        email: String(email || "")
          .trim()
          .toLowerCase(),
      };
      const { data } = await api.post("/auth/send-otp", payload);
      return data;
    } catch (error) {
      if (error?.response?.data?.message) {
        throw error.response.data.message;
      }

      const debugInfo = getApiDebugInfo();
      const activeBaseUrl = debugInfo?.activeBaseUrl || "unknown";
      throw `Failed to send OTP. Unable to reach backend at ${activeBaseUrl}. Check that backend is running and EXPO_PUBLIC_API_URL in mobile/.env points to your current LAN IP.`;
    }
  };

  const registerWithOtp = async (name, email, password, role, otp) => {
    try {
      const payload = {
        name: String(name || "").trim(),
        email: String(email || "")
          .trim()
          .toLowerCase(),
        password: String(password || ""),
        role,
        otp: String(otp || "").trim(),
      };

      const { data } = await api.post("/auth/verify-otp", payload);
      setUser(data);
      setUserToken(data.token);
      await AsyncStorage.setItem("userToken", data.token);
      await AsyncStorage.setItem("userInfo", JSON.stringify(data));
      return data;
    } catch (error) {
      throw error?.response?.data?.message || "OTP verification failed";
    }
  };

  const sendForgotPasswordOtp = async (email) => {
    try {
      const payload = {
        email: String(email || "")
          .trim()
          .toLowerCase(),
      };
      const { data } = await api.post(
        "/auth/forgot-password/send-otp",
        payload,
      );
      return data;
    } catch (error) {
      if (error?.response?.data?.message) {
        throw error.response.data.message;
      }

      const debugInfo = getApiDebugInfo();
      const activeBaseUrl = debugInfo?.activeBaseUrl || "unknown";
      throw `Failed to send reset OTP. Unable to reach backend at ${activeBaseUrl}. Check that backend is running and EXPO_PUBLIC_API_URL in mobile/.env points to your current LAN IP.`;
    }
  };

  const resetPasswordWithOtp = async (email, otp, newPassword) => {
    try {
      const payload = {
        email: String(email || "")
          .trim()
          .toLowerCase(),
        otp: String(otp || "").trim(),
        newPassword: String(newPassword || ""),
      };
      const { data } = await api.post("/auth/forgot-password/reset", payload);
      return data;
    } catch (error) {
      throw error?.response?.data?.message || "Failed to reset password";
    }
  };

  const logout = async () => {
    setUser(null);
    setUserToken(null);
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("userInfo");
  };

  const updateUser = async (updates) => {
    const nextUser = { ...(user || {}), ...(updates || {}) };
    setUser(nextUser);
    await AsyncStorage.setItem("userInfo", JSON.stringify(nextUser));
    return nextUser;
  };

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      const storageRead = Promise.all([
        AsyncStorage.getItem("userToken"),
        AsyncStorage.getItem("userInfo"),
      ]);

      const fallbackAfterTimeout = new Promise((resolve) => {
        setTimeout(() => resolve([null, null]), 3500);
      });

      const [token, userInfo] = await Promise.race([
        storageRead,
        fallbackAfterTimeout,
      ]);

      if (token && userInfo) {
        setUserToken(token);
        setUser(JSON.parse(userInfo));
      }
    } catch (e) {
      console.log("isLoggedIn error", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        register,
        sendRegisterOtp,
        registerWithOtp,
        sendForgotPasswordOtp,
        resetPasswordWithOtp,
        verifyLoginTwoFactorOtp,
        resendLoginTwoFactorOtp,
        updateUser,
        user,
        userToken,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
