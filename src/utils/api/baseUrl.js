import appConfig from "@/config/app.config";

export function requireApiBaseUrl() {
  const base = (appConfig.api.baseUrl || "").trim();
  if (!base) throw new Error("NEXT_PUBLIC_API_BASE_URL no configurada");
  return base.replace(/\/$/, "");
}
