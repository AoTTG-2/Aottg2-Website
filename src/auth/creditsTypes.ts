export interface PublicCreditContributor {
  name: string;
}

export interface PublicCreditCategory {
  name: string;
  contributors: PublicCreditContributor[];
}

export interface PublicCreditsResponse {
  categories: PublicCreditCategory[];
}

export interface AdminCreditContributor {
  id: string;
  name: string;
  accountId: string | null;
  accountDisplayName?: string | null;
  sortOrder: number;
}

export interface AdminCreditCategory {
  id: string;
  name: string;
  sortOrder: number;
  contributors: AdminCreditContributor[];
}

export interface AdminCreditsResponse {
  categories: AdminCreditCategory[];
}

export interface UpdateCreditsRequest {
  categories: Array<{
    id?: string | null;
    name: string;
    contributors: Array<{
      id?: string | null;
      name: string;
      accountId?: string | null;
    }>;
  }>;
}
