import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import Constants from "expo-constants";

const extractHostFromValue = (value) => {
  const input = String(value || "").trim();
  if (!input) return "";

  const ipv4Match = input.match(/\b\d{1,3}(?:\.\d{1,3}){3}\b/);
  if (ipv4Match?.[0]) {
    return ipv4Match[0];
  }

  const withoutProtocol = input.replace(/^https?:\/\//i, "");
  const hostToken = withoutProtocol.split(/[/:\s]/)[0];
  if (!hostToken || hostToken.includes("@")) {
    return "";
  }
  return hostToken;
};

const resolveCandidateHosts = () => {
  const hosts = [];

  const expoHostUri =
    Constants?.expoConfig?.hostUri ||
    Constants?.manifest2?.extra?.expoGo?.debuggerHost ||
    Constants?.manifest?.debuggerHost;
  hosts.push(extractHostFromValue(expoHostUri));

  const expoDebuggerHost =
    Constants?.expoGoConfig?.debuggerHost ||
    Constants?.expoConfig?.extra?.expoGo?.debuggerHost;
  hosts.push(extractHostFromValue(expoDebuggerHost));

  const serverHost = Platform.constants?.ServerHost;
  hosts.push(extractHostFromValue(serverHost));

  if (Platform.OS === "android") {
    hosts.push("10.0.2.2");
    hosts.push("127.0.0.1");
    hosts.push("localhost");
  } else {
    hosts.push("127.0.0.1");
    hosts.push("localhost");
  }

  const seen = new Set();
  return hosts.filter((host) => {
    const normalized = String(host || "").trim();
    if (!normalized || seen.has(normalized)) {
      return false;
    }
    seen.add(normalized);
    return true;
  });
};

const configuredBaseUrl = (process.env.EXPO_PUBLIC_API_URL || "").trim();
const autoDetectedBaseUrls = resolveCandidateHosts().map(
  (host) => `http://${host}:5000/api`,
);
const candidateBaseUrls = [configuredBaseUrl, ...autoDetectedBaseUrls].filter(
  (url, index, arr) => {
    const normalized = String(url || "").trim();
    return Boolean(normalized) && arr.indexOf(normalized) === index;
  },
);

const BASE_URL = candidateBaseUrls[0] || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

export const getApiDebugInfo = () => ({
  configuredBaseUrl,
  candidateBaseUrls,
  activeBaseUrl: api.defaults.baseURL,
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData - let axios/browser handle it
    // This ensures multipart/form-data boundary is properly set
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      console.log(
        "📤 [AXIOS] FormData detected, Content-Type removed for",
        config.url,
      );
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    if (response.config.data instanceof FormData) {
      console.log(
        "✅ [AXIOS] FormData response received:",
        response.status,
        response.config.url,
      );
    }
    return response;
  },
  async (error) => {
    const originalConfig = error?.config;
    const isNetworkError = !error?.response;

    if (originalConfig?.data instanceof FormData) {
      console.log("❌ [AXIOS] FormData request failed:", {
        status: error?.response?.status,
        message: error?.message,
        url: originalConfig?.url,
      });
    }

    if (!originalConfig || !isNetworkError) {
      return Promise.reject(error);
    }

    const attemptedBaseUrl = originalConfig.baseURL || BASE_URL;
    const attemptedBaseUrls = Array.isArray(originalConfig._attemptedBaseUrls)
      ? originalConfig._attemptedBaseUrls
      : [];

    const updatedAttemptedBaseUrls = attemptedBaseUrls.includes(
      attemptedBaseUrl,
    )
      ? attemptedBaseUrls
      : [...attemptedBaseUrls, attemptedBaseUrl];

    originalConfig._attemptedBaseUrls = updatedAttemptedBaseUrls;

    const nextBaseUrl = candidateBaseUrls.find(
      (url) => !updatedAttemptedBaseUrls.includes(url),
    );

    if (!nextBaseUrl) {
      if (originalConfig?.data instanceof FormData) {
        console.log(
          "🛑 [AXIOS] Exhausted base URL retries:",
          updatedAttemptedBaseUrls,
        );
      }
      return Promise.reject(error);
    }

    console.log("🔄 [AXIOS] Retrying with next base URL:", nextBaseUrl);
    originalConfig.baseURL = nextBaseUrl;
    api.defaults.baseURL = nextBaseUrl;
    return api.request(originalConfig);
  },
);

export default api;
