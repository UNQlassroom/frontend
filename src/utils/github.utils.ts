export const GITHUB_ORGANIZATION: string =
  import.meta.env.VITE_GITHUB_ORGANIZATION || "UNQlassroom-cursos";

export const getGitHubRepoUrl = (repoName: string): string => {
  return `https://github.com/${GITHUB_ORGANIZATION}/${repoName}`;
};

export const getGitHubIssuesUrl = (repoName: string, issueNumber?: number): string => {
  const base = getGitHubRepoUrl(repoName);
  return issueNumber ? `${base}/issues/${issueNumber}` : `${base}/issues`;
};

export const getGitHubNewIssueUrl = (
  repoName: string,
  title?: string,
  body?: string
): string => {
  const base = `${getGitHubRepoUrl(repoName)}/issues/new`;
  const params = new URLSearchParams();
  if (title) params.set("title", title);
  if (body) params.set("body", body);

  const query = params.toString();
  return query ? `${base}?${query}` : base;
};
