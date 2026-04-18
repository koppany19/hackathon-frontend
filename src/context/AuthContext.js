import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAuthToken } from "../api/client";
import { getMe } from "../api/endpoints/auth";
import { normalizeUser } from "../utils/normalizeUser";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const t = await AsyncStorage.getItem("authToken");
        if (t) {
          setAuthToken(t);
          try {
            const res = await getMe();
            setToken(t);
            setUser(normalizeUser(res.user ?? res));
          } catch {
            setAuthToken(null);
            await AsyncStorage.removeItem("authToken").catch(() => {});
          }
        }
      } catch {
        // AsyncStorage unavailable — start unauthenticated
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const saveAuth = async (newToken, newUser) => {
    const clean = normalizeUser(newUser);
    setToken(newToken);
    setUser(clean);
    setAuthToken(newToken);
    await AsyncStorage.setItem("authToken", newToken);
  };

  const updateScheduleItems = (scheduleItems) => {
    setUser((prev) => (prev ? { ...prev, scheduleItems } : prev));
  };

  const clearAuth = async () => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
    await AsyncStorage.removeItem("authToken");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        saveAuth,
        clearAuth,
        updateScheduleItems,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
