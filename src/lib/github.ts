export const GITHUB_ORGANIZATION: string =
  import.meta.env.VITE_GITHUB_ORGANIZATION || "unqlassroom";

export const getGitHubTeamUrl = (teamSlug: string): string => {
  return `https://github.com/orgs/${GITHUB_ORGANIZATION}/teams/${teamSlug}`;
};