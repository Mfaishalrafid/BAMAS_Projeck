import "server-only";
import {
  ConfigurationError,
  readAuthSettings,
} from "@/features/auth/application/settings";
export { ConfigurationError };
export function databaseUrl() {
  const value = process.env.DATABASE_URL;
  if (!value) throw new ConfigurationError();
  return value;
}
export function authConfig() {
  return readAuthSettings(process.env);
}
