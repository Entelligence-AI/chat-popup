import { apiUrl } from "@/utils/contants";
import axios, { AxiosError } from 'axios';

interface FetchRepositoryAgentParams {
    question: { text: string }[];
    apiKey: string;
    organization: string;
    repoName: string;
    abortSignal: AbortSignal;
}

export const fetchRepositoryAgent = async ({
    question,
    apiKey,
    organization,
    repoName,
    abortSignal
}: FetchRepositoryAgentParams) => {
    const url = `${apiUrl}repositoryAgent/`;
    const data = {
        question: question[0]?.text,
        history: [],
        vectorDBUrl: `${organization}&${repoName}`,
    };
    const config = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        signal: abortSignal,
    };

    try {
        const response = await axios.post(url, data, config);
        return response.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error('Error fetching repository agent:', error.message);
            throw new Error(`Failed to fetch repository agent: ${error.message}`);
        }
        console.error('Unexpected error:', error);
        throw error;
    }
};