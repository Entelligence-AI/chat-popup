export type AnalyticsData = {
    apiKey: string;
    repoName: string;
    organization: string;
    theme?: 'light' | 'dark';
 	numQuestions: number;
    setNumQuestions: React.Dispatch<React.SetStateAction<number>>;
}

export type InitType = {
    analyticsData: AnalyticsData;
}
