export type AnalyticsData = {
    apiKey: string;
    repoName: string;
    organization: string;
    theme?: 'light' | 'dark';
}

export type InitType = {
    analyticsData: AnalyticsData;
}
