import { ref, computed } from 'vue';
import type { Credentials, GitHost, Role, TrackerType } from './useAuth';

export interface Project {
  id: string;
  name: string;
  credentials: Credentials;
}

const PROJECTS_KEY = 'projects';
const ACTIVE_KEY = 'active_project';

// Старые «плоские» ключи — нужны для миграции в проектную модель.
const LEGACY_KEYS = {
  tracker: 'tracker',
  ytToken: 'yt_token',
  ytUrl: 'yt_url',
  trelloKey: 'trello_key',
  trelloToken: 'trello_token',
  trelloBoardId: 'trello_board_id',
  figma: 'figma_token',
  repoPath: 'repo_path',
  gitHost: 'git_host',
  gitToken: 'git_token',
  gitlabUrl: 'gitlab_url',
  roles: 'roles',
} as const;

const VALID_ROLES: Role[] = ['pm', 'lead'];

function emptyCredentials(): Credentials {
  return {
    tracker: 'youtrack',
    figmaToken: '',
    repoPath: '',
    youtrackToken: '',
    youtrackUrl: '',
    trelloKey: '',
    trelloToken: '',
    trelloBoardId: '',
    gitHost: '',
    githubToken: '',
    gitlabToken: '',
    gitlabUrl: '',
    roles: [],
    columns: [],
  };
}

export function emptyCreds(): Credentials {
  return emptyCredentials();
}

function genId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function parseRoles(raw: string | null): Role[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((r): r is Role => VALID_ROLES.includes(r));
  } catch {
    return [];
  }
}

// Если в localStorage/sessionStorage лежат старые «плоские» ключи —
// заворачиваем их в один проект и удаляем. Возвращает массив с этим проектом
// (или пустой), и id для активации.
function migrateLegacyCreds(): { projects: Project[]; activeId: string } {
  for (const storage of [localStorage, sessionStorage]) {
    const tracker = storage.getItem(LEGACY_KEYS.tracker) as TrackerType | null;
    if (!tracker) continue;
    const gitHost = (storage.getItem(LEGACY_KEYS.gitHost) as GitHost) ?? '';
    const gitToken = storage.getItem(LEGACY_KEYS.gitToken) ?? '';
    const credentials: Credentials = {
      tracker,
      figmaToken: storage.getItem(LEGACY_KEYS.figma) ?? '',
      repoPath: storage.getItem(LEGACY_KEYS.repoPath) ?? '',
      youtrackToken: storage.getItem(LEGACY_KEYS.ytToken) ?? '',
      youtrackUrl: storage.getItem(LEGACY_KEYS.ytUrl) ?? '',
      trelloKey: storage.getItem(LEGACY_KEYS.trelloKey) ?? '',
      trelloToken: storage.getItem(LEGACY_KEYS.trelloToken) ?? '',
      trelloBoardId: storage.getItem(LEGACY_KEYS.trelloBoardId) ?? '',
      gitHost,
      githubToken: gitHost === 'github' ? gitToken : '',
      gitlabToken: gitHost === 'gitlab' ? gitToken : '',
      gitlabUrl: storage.getItem(LEGACY_KEYS.gitlabUrl) ?? '',
      roles: parseRoles(storage.getItem(LEGACY_KEYS.roles)),
    };
    const project: Project = {
      id: genId(),
      name: deriveDefaultName(credentials.repoPath),
      credentials,
    };
    Object.values(LEGACY_KEYS).forEach((k) => storage.removeItem(k));
    return { projects: [project], activeId: project.id };
  }
  return { projects: [], activeId: '' };
}

// Если в localStorage уже лежат проекты в старом формате (с единым `gitToken`) —
// перепакуем в новый: githubToken/gitlabToken по выбранному gitHost.
function migrateProjectShape(project: Project): Project {
  const c = project.credentials as Credentials & { gitToken?: string };
  if (c && typeof c.gitToken === 'string') {
    const host = c.gitHost ?? '';
    c.githubToken = host === 'github' ? c.gitToken : '';
    c.gitlabToken = host === 'gitlab' ? c.gitToken : '';
    delete c.gitToken;
  }
  if (typeof c.githubToken !== 'string') c.githubToken = '';
  if (typeof c.gitlabToken !== 'string') c.gitlabToken = '';
  return project;
}

// task:{taskId}:{field}  →  project:{projectId}:task:{taskId}:{field}
function migrateLegacyTaskKeys(projectId: string) {
  const moved: Array<[string, string]> = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;
    if (k.startsWith('task:')) {
      const v = localStorage.getItem(k);
      if (v != null) moved.push([k, v]);
    }
  }
  for (const [oldKey, value] of moved) {
    localStorage.setItem(`project:${projectId}:${oldKey}`, value);
    localStorage.removeItem(oldKey);
  }
}

function deriveDefaultName(repoPath: string): string {
  const trimmed = (repoPath || '').trim();
  if (!trimmed) return 'Проект 1';
  const segs = trimmed.replace(/\/+$/, '').split('/');
  return segs[segs.length - 1] || 'Проект 1';
}

function loadInitial(): { projects: Project[]; activeId: string } {
  const raw = localStorage.getItem(PROJECTS_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const projects = (parsed as Project[]).map(migrateProjectShape);
        // Если форма проектов поменялась — перепишем в storage.
        const before = JSON.stringify(parsed);
        const after = JSON.stringify(projects);
        if (before !== after) localStorage.setItem(PROJECTS_KEY, after);
        const activeId = localStorage.getItem(ACTIVE_KEY) ?? projects[0]?.id ?? '';
        return { projects, activeId };
      }
    } catch {}
  }
  // Свежий запуск или старый формат — пробуем мигрировать
  const migrated = migrateLegacyCreds();
  if (migrated.projects.length) {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(migrated.projects));
    localStorage.setItem(ACTIVE_KEY, migrated.activeId);
    migrateLegacyTaskKeys(migrated.activeId);
  }
  return migrated;
}

const initial = loadInitial();
const projectsRef = ref<Project[]>(initial.projects);
const activeIdRef = ref<string>(initial.activeId);

function persistProjects() {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projectsRef.value));
}
function persistActive() {
  if (activeIdRef.value) localStorage.setItem(ACTIVE_KEY, activeIdRef.value);
  else localStorage.removeItem(ACTIVE_KEY);
}

function removeProjectTaskKeys(projectId: string) {
  const prefix = `project:${projectId}:`;
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(prefix)) toRemove.push(k);
  }
  toRemove.forEach((k) => localStorage.removeItem(k));
}

export function useProjects() {
  const projects = projectsRef;
  const activeProjectId = computed(() => activeIdRef.value);
  const activeProject = computed<Project | null>(
    () => projects.value.find((p) => p.id === activeIdRef.value) ?? null
  );

  function addProject(name: string, credentials?: Credentials): Project {
    const safeName = name.trim() || `Проект ${projects.value.length + 1}`;
    const project: Project = {
      id: genId(),
      name: safeName,
      credentials: credentials ?? emptyCredentials(),
    };
    projects.value = [...projects.value, project];
    persistProjects();
    activeIdRef.value = project.id;
    persistActive();
    return project;
  }

  function switchProject(id: string) {
    if (!projects.value.some((p) => p.id === id)) return;
    activeIdRef.value = id;
    persistActive();
  }

  function updateActiveCredentials(credentials: Credentials) {
    const id = activeIdRef.value;
    if (!id) return;
    projects.value = projects.value.map((p) =>
      p.id === id ? { ...p, credentials } : p
    );
    persistProjects();
  }

  function patchActiveCredentials(patch: Partial<Credentials>) {
    const id = activeIdRef.value;
    if (!id) return;
    projects.value = projects.value.map((p) =>
      p.id === id ? { ...p, credentials: { ...p.credentials, ...patch } } : p
    );
    persistProjects();
  }

  function renameProject(id: string, name: string) {
    if (!name.trim()) return;
    projects.value = projects.value.map((p) =>
      p.id === id ? { ...p, name: name.trim() } : p
    );
    persistProjects();
  }

  function deleteProject(id: string) {
    const remaining = projects.value.filter((p) => p.id !== id);
    projects.value = remaining;
    persistProjects();
    removeProjectTaskKeys(id);
    if (activeIdRef.value === id) {
      activeIdRef.value = remaining[0]?.id ?? '';
      persistActive();
    }
  }

  // Полный сброс — для logout
  function clearAll() {
    const ids = projects.value.map((p) => p.id);
    ids.forEach(removeProjectTaskKeys);
    projects.value = [];
    activeIdRef.value = '';
    localStorage.removeItem(PROJECTS_KEY);
    localStorage.removeItem(ACTIVE_KEY);
  }

  return {
    projects,
    activeProject,
    activeProjectId,
    addProject,
    switchProject,
    updateActiveCredentials,
    patchActiveCredentials,
    renameProject,
    deleteProject,
    clearAll,
    deriveDefaultName,
  };
}
