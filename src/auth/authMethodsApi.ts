import { request } from "./api";
import type { AuthMethodsResponse, ErrorResponse, UpdateAuthMethodsRequest } from "./types";

export const authMethodsApi = {
  getPublic: (signal?: AbortSignal) =>
    request<AuthMethodsResponse & ErrorResponse>("/auth/methods", { signal }, false),

  getAdmin: (signal?: AbortSignal) =>
    request<AuthMethodsResponse & ErrorResponse>("/admin/auth-methods", { signal }),

  updateAdmin: (body: UpdateAuthMethodsRequest) =>
    request<AuthMethodsResponse & ErrorResponse>("/admin/auth-methods", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
};
