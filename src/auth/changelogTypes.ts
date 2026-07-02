export interface ChangelogEntryResponse {
  id: string;
  version: string;
  contentMarkdown: string;
  contentHash: string;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChangelogListResponse {
  total: number;
  page: number;
  pageSize: number;
  entries: ChangelogEntryResponse[];
}

export interface CreateChangelogRequest {
  version: string;
  contentMarkdown: string;
}

export interface UpdateChangelogRequest {
  version?: string;
  contentMarkdown?: string;
}
