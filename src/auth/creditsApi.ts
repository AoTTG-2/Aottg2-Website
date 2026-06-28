import { request } from "./api";
import type { ErrorResponse } from "./types";
import type { AdminCreditsResponse, PublicCreditsResponse, UpdateCreditsRequest } from "./creditsTypes";

export const creditsApi = {
  getPublic: (signal?: AbortSignal) =>
    request<PublicCreditsResponse & ErrorResponse>("/credits", { signal }, false),

  getAdmin: (signal?: AbortSignal) =>
    request<AdminCreditsResponse & ErrorResponse>("/admin/credits", { signal }),

  updateAdmin: (body: UpdateCreditsRequest) =>
    request<AdminCreditsResponse & ErrorResponse>("/admin/credits", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
};
