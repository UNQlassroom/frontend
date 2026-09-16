export const GITHUB_ORGANIZATION: string =
  import.meta.env.VITE_GITHUB_ORGANIZATION || "unqlassroom";

export const getGitHubRepoUrl = (repoName: string ): string => {
    return `https://github.com/${GITHUB_ORGANIZATION}/${repoName}`; // TODO parametrizar con nombre del alumno
};
