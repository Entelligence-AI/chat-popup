export type AnalyticsData = {
  apiKey: string;
  repoName: string;
  organization: string;
  theme?: 'light' | 'dark';
};

export type InitType = {
  analyticsData: AnalyticsData;
};

export interface headerObject {
  Useruuid?: string;
  Useremail?: string;
  Username?: string;
  Orguuid?: string;
  Orgname?: string;
}

export interface ConversationReqRepository {
  UserUUID?: string;
  RepositoryUUID?: string;
  Name?: string;
  VectorDBUrl: string;
}

export interface User {
  UserUUID?: string;
  FirstName?: string;
  LastName?: string;
  Email: string;
  OrganizationUUID?: string;
  Role?: string;
  Image?: string;
}

export interface Conversation {
    UUID: string;
    UserUUID: string;
    Name: string;
    StartDate: string;
    RepositoryUUID: string;
    TicketUUID: string;
    IsActive: boolean;
    VectorDBUrl: string;
  }
