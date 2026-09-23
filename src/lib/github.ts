export const GITHUB_ORGANIZATION: string =
  import.meta.env.VITE_GITHUB_ORGANIZATION || "unqlassroom";

export const getGitHubRepoUrl = (repoName: string): string => {
    return `https://github.com/${GITHUB_ORGANIZATION}/${repoName}`;
};

export const getGitHubIssuesUrl = (repoName: string, issueNumber?: number): string => {
  const base = getGitHubRepoUrl(repoName);
  return issueNumber ? `${base}/issues/${issueNumber}` : `${base}/issues`;
};
