import api from "../config/api";

export const resolveMediaUrl = (url) => {
  const rawUrl = String(url || "").trim();
  if (!rawUrl) return "";
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl;

  const baseUrl = String(api.defaults.baseURL || "").replace(/\/api\/?$/, "");
  if (!baseUrl) return rawUrl;
  return `${baseUrl}${rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`}`;
};
