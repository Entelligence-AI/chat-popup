export type AnalyticsData = {
    apiKey: string;
    repoName: string;
    organization: string;
    theme?: 'light' | 'dark';
    companyName?: string;
}

export type InitType = {
    analyticsData: AnalyticsData;
}
