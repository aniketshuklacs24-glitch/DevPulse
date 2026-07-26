import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from './store';

export interface PullRequest {
  id: number;
  number: number;
  title: string;
  state: string;
  created_at: string;
  user: {
    login: string;
    avatar_url: string;
  };
}

export interface PRAnalytics {
  prId: string;
  title: string;
  timeToMergeHours: number;
  filesChanged: number;
  linesAdded: number;
  linesRemoved: number;
  status: string;
}

export const githubApi = createApi({
  reducerPath: 'githubApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/', // Use root and proxy or absolute URLs
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      // ONLY set authorization header if it is a real token, NOT the mock token
      if (token && token !== 'mock_github_token_123') {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['PullRequest', 'Analytics'],
  endpoints: (builder) => ({
    getPullRequests: builder.query<PullRequest[], { owner: string; repo: string }>({
      query: ({ owner, repo }) => `https://api.github.com/repos/${owner}/${repo}/pulls?state=all`,
      providesTags: ['PullRequest'],
    }),
    getAnalytics: builder.query<PRAnalytics[], void>({
      query: () => `api/analytics`,
      providesTags: ['Analytics'],
    }),
  }),
});

export const { useGetPullRequestsQuery, useGetAnalyticsQuery } = githubApi;
