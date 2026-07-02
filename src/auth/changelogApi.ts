import { request } from "./api";
import type { ErrorResponse } from "./types";
import type { ChangelogEntryResponse, ChangelogListResponse, CreateChangelogRequest, UpdateChangelogRequest } from "./changelogTypes";

export const changelogApi = {
  listAdmin: (signal?: AbortSignal) =>
    request<ChangelogListResponse & ErrorResponse>("/admin/changelogs", { signal }),

  createAdmin: (body: CreateChangelogRequest) =>
    request<ChangelogEntryResponse & ErrorResponse>("/admin/changelogs", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateAdmin: (id: string, body: UpdateChangelogRequest) =>
    request<ChangelogEntryResponse & ErrorResponse>(`/admin/changelogs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  publishAdmin: (id: string) =>
    request<ChangelogEntryResponse & ErrorResponse>(`/admin/changelogs/${id}/publish`, { method: "POST" }),

  unpublishAdmin: (id: string) =>
    request<ChangelogEntryResponse & ErrorResponse>(`/admin/changelogs/${id}/unpublish`, { method: "POST" }),

  deleteAdmin: (id: string) =>
    request<ErrorResponse>(`/admin/changelogs/${id}`, { method: "DELETE" }),
};
