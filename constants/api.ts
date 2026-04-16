import Constants from "expo-constants";
import * as Linking from "expo-linking";
import { Platform } from "react-native";

const REQUEST_TIMEOUT_MS = 8000;
const MANUAL_API_URL = process.env.EXPO_PUBLIC_API_URL?.trim();

function extractHost(value?: string | null) {
  if (!value) {
    return null;
  }

  const sanitizedValue = value.trim().replace(/\s+/g, "");
  const normalizedValue = sanitizedValue.includes("://")
    ? sanitizedValue
    : `http://${sanitizedValue}`;
  const match = normalizedValue.match(/^[a-zA-Z]+:\/\/([^/:]+)/);
  const host = match?.[1]?.trim();

  if (!host || host === "localhost" || host === "127.0.0.1") {
    return null;
  }

  return host;
}

function getWebHost() {
  if (Platform.OS !== "web" || typeof window === "undefined") {
    return null;
  }

  return window.location.hostname || "localhost";
}

function getExpoHostFromConstants() {
  return (
    extractHost(Constants.expoConfig?.hostUri) ||
    extractHost(Constants.linkingUri) ||
    extractHost(Constants.expoGoConfig?.developer?.tool) ||
    extractHost(Constants.platform?.hostUri)
  );
}

function getExpoHostFromLinking() {
  try {
    const url = Linking.createURL("/");
    return extractHost(url);
  } catch {
    return null;
  }
}

function getDefaultApiBaseUrl() {
  const webHost = getWebHost();

  if (webHost) {
    return `http://${webHost}:3000`;
  }

  const expoHost = getExpoHostFromConstants() || getExpoHostFromLinking();

  if (expoHost) {
    return `http://${expoHost}:3000`;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000";
  }

  return "http://localhost:3000";
}

export const API_BASE_URL = MANUAL_API_URL || getDefaultApiBaseUrl();

export async function apiFetch(
  path: string,
  init?: RequestInit,
  timeoutMs = REQUEST_TIMEOUT_MS
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
