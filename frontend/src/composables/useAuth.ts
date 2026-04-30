import { computed } from 'vue';
import { useProjects, emptyCreds } from './useProjects';

export type TrackerType = 'youtrack' | 'trello';
export type GitHost = 'github' | 'gitlab' | '';
export type Role = 'pm' | 'lead';

export interface Credentials {
  tracker: TrackerType;
  figmaToken: string;
  repoPath: string;
  // YouTrack
  youtrackToken: string;
  youtrackUrl: string;
  // Trello
  trelloKey: string;
  trelloToken: string;
  trelloBoardId: string;
  // Git host (для MR/PR)
  gitHost: GitHost;
  githubToken: string;
  gitlabToken: string;
  gitlabUrl: string;
  // Включённые роли (PM, Tech Lead). Дефолт — пусто.
  roles: Role[];
  // Список колонок для отображения на доске. Пусто = показывать все.
  columns: string[];
}

export interface LoginParams extends Credentials {
  remember: boolean;
  // Имя проекта при логине; если пусто — выводим из repoPath или ставим «Проект 1».
  projectName?: string;
}

const VALID_ROLES: Role[] = ['pm', 'lead'];

export function useAuth() {
  const {
    activeProject,
    addProject,
    updateActiveCredentials,
    patchActiveCredentials,
    clearAll,
    deriveDefaultName,
  } = useProjects();

  // Для совместимости: credentials остаётся как ref<Credentials | null>, но теперь
  // это computed на основе активного проекта. Все компоненты читают .value.* как раньше.
  const credentials = computed<Credentials | null>(
    () => activeProject.value?.credentials ?? null
  );

  function login(params: LoginParams) {
    // Игнорируем remember — теперь проекты живут в localStorage всегда.
    const { remember: _r, projectName, ...creds } = params;
    const name = (projectName ?? '').trim() || deriveDefaultName(creds.repoPath);
    addProject(name, creds);
  }

  function updateCredentials(params: Credentials) {
    updateActiveCredentials({ ...params });
  }

  function setRoles(roles: Role[]) {
    if (!activeProject.value) return;
    const valid = roles.filter((r) => VALID_ROLES.includes(r));
    patchActiveCredentials({ roles: valid });
  }

  function logout() {
    clearAll();
  }

  function authHeaders(): Record<string, string> {
    if (!credentials.value) return {};
    const c = credentials.value;
    const activeGitToken = c.gitHost === 'github'
      ? c.githubToken
      : c.gitHost === 'gitlab'
        ? c.gitlabToken
        : '';
    return {
      'X-Tracker': c.tracker,
      'X-YouTrack-Token': c.youtrackToken,
      'X-YouTrack-Url': c.youtrackUrl,
      'X-Figma-Token': c.figmaToken,
      'X-Trello-Key': c.trelloKey,
      'X-Trello-Token': c.trelloToken,
      'X-Trello-Board-Id': c.trelloBoardId,
      'X-Git-Host': c.gitHost,
      'X-Git-Token': activeGitToken,
      'X-Gitlab-Url': c.gitlabUrl,
    };
  }

  return { credentials, login, logout, authHeaders, setRoles, updateCredentials };
}

// Для случаев, когда нужно сделать пустые креды (например для нового проекта).
export { emptyCreds };

// Снимает потенциально устаревшие поля неактивного трекера и git-хоста.
// Если пользователь сначала ввёл YouTrack-токен, потом переключился на Trello —
// при сохранении YouTrack-токен очищается. Аналогично для GitHub vs GitLab —
// токен и URL чужого хоста зануляются.
export function normalizeCreds(input: Credentials): Credentials {
  const trim = (s: string) => (s ?? '').trim();
  const isYt = input.tracker === 'youtrack';
  const isTrello = input.tracker === 'trello';
  return {
    tracker: input.tracker,
    figmaToken: trim(input.figmaToken),
    repoPath: trim(input.repoPath),
    youtrackUrl: isYt ? trim(input.youtrackUrl) : '',
    youtrackToken: isYt ? trim(input.youtrackToken) : '',
    trelloKey: isTrello ? trim(input.trelloKey) : '',
    trelloToken: isTrello ? trim(input.trelloToken) : '',
    trelloBoardId: isTrello ? trim(input.trelloBoardId) : '',
    gitHost: input.gitHost,
    githubToken: input.gitHost === 'github' ? trim(input.githubToken) : '',
    gitlabToken: input.gitHost === 'gitlab' ? trim(input.gitlabToken) : '',
    gitlabUrl: input.gitHost === 'gitlab' ? trim(input.gitlabUrl) : '',
    roles: [...(input.roles ?? [])],
    columns: [...(input.columns ?? [])],
  };
}
