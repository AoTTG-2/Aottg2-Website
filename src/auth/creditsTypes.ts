export interface PublicCreditContributor {
  name: string;
}

export interface PublicCreditCategory {
  name: string;
  description?: string | null;
  contributors: PublicCreditContributor[];
  groups: PublicCreditGroup[];
}

export interface PublicCreditGroup {
  title: string;
  description?: string | null;
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
  description?: string | null;
  sortOrder: number;
  contributors: AdminCreditContributor[];
  groups: AdminCreditGroup[];
}

export interface AdminCreditGroup {
  id: string;
  title: string;
  description?: string | null;
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
    description?: string | null;
    contributors: Array<{
      id?: string | null;
      name: string;
      accountId?: string | null;
    }>;
    groups: Array<{
      id?: string | null;
      title: string;
      description?: string | null;
      contributors: Array<{
        id?: string | null;
        name: string;
        accountId?: string | null;
      }>;
    }>;
  }>;
}
