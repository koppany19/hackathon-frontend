import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../constants/config";

const defaultHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
}

async function resolveToken() {
  if (authToken) return authToken;
  const stored = await AsyncStorage.getItem("authToken");
  if (stored) authToken = stored;
  return stored;
}

function isFormDataBody(value) {
  if (!value || typeof value !== "object") return false;
  if (typeof FormData !== "undefined" && value instanceof FormData) {
    return true;
  }

  return (
    typeof value.append === "function" &&
    (typeof value.getParts === "function" ||
      Object.prototype.toString.call(value) === "[object FormData]")
  );
}

async function request(endpoint, options = {}) {
  const url = `${config.API_BASE_URL}${endpoint}`;
  const isFormData = isFormDataBody(options.body);
  const token = await resolveToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      ...(isFormData ? { Accept: "application/json" } : defaultHeaders),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const client = {
  get: (endpoint, options) => request(endpoint, { method: "GET", ...options }),
  post: (endpoint, body, options) =>
    request(endpoint, {
      method: "POST",
      body: isFormDataBody(body) ? body : JSON.stringify(body),
      ...options,
    }),
  put: (endpoint, body, options) =>
    request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
      ...options,
    }),
  patch: (endpoint, body, options) =>
    request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
      ...options,
    }),
  delete: (endpoint, options) =>
    request(endpoint, { method: "DELETE", ...options }),
};

export default client;
