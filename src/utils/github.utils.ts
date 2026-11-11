export const GITHUB_ORGANIZATION: string =
  import.meta.env.VITE_GITHUB_ORGANIZATION || "UNQlassroom-cursos";

export const GITHUB_USERNAME_REGEX =
  /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

export const isValidGitHubUsername = (username: string): boolean => {
  return GITHUB_USERNAME_REGEX.test(username);
};

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

/**
 * Resuelve la URL adecuada hacia un commit específico o a la lista de commits en GitHub.
 */
export const getGitHubCommitUrl = (
  repoUrl?: string | null,
  commitShaOrMsg?: string | null,
  advertenciasGit?: { commitSha?: string }[]
): string | null => {
  if (!repoUrl) return null;
  const shaCandidate = commitShaOrMsg?.trim();
  if (shaCandidate && /^[0-9a-f]{7,40}$/i.test(shaCandidate)) {
    return `${repoUrl}/commit/${shaCandidate}`;
  }
  const shaAdvertencia = advertenciasGit?.[0]?.commitSha;
  if (shaAdvertencia) {
    return `${repoUrl}/commit/${shaAdvertencia}`;
  }
  return `${repoUrl}/commits`;
};

export interface InfoRepoPersonal {
  nombreSugerido: string;
  urlNormalizada: string;
}

/**
 * Parsea una URL de repositorio de GitHub (`https://github.com/usuario/repositorio`, con o sin `.git`).
 * Devuelve el nombre sugerido para el repo y la URL normalizada.
 */
export function parsearRepoPersonal(input: string): InfoRepoPersonal | null {
  const trimmed = input.trim().replace(/\.git$/i, "").replace(/\/+$/, "");
  if (!trimmed) return null;

  const httpsMatch = trimmed.match(
    /^https?:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/i
  );
  if (httpsMatch) {
    return {
      nombreSugerido: httpsMatch[2],
      urlNormalizada: `https://github.com/${httpsMatch[1]}/${httpsMatch[2]}`,
    };
  }

  return null;
}
