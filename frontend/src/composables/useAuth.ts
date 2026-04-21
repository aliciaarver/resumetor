import { ref } from 'vue';

export type TrackerType = 'youtrack' | 'trello';

export interface Credentials {
  tracker: TrackerType;
  figmaToken: string;
  figmaUrl: string;
  repoPath: string;
  // YouTrack
  youtrackToken: string;
  youtrackUrl: string;
  // Trello
  trelloKey: string;
  trelloToken: string;
  trelloBoardId: string;
}

export interface LoginParams extends Omit<Credentials, never> {
  remember: boolean;
}

const KEYS = {
  tracker: 'tracker',
  figma: 'figma_token',
  figmaUrl: 'figma_url',
  repoPath: 'repo_path',
  ytToken: 'yt_token',
  ytUrl: 'yt_url',
  trelloKey: 'trello_key',
  trelloToken: 'trello_token',
  trelloBoardId: 'trello_board_id',
} as const;

function load(): Credentials | null {
  for (const s of [localStorage, sessionStorage]) {
    const tracker = s.getItem(KEYS.tracker) as TrackerType | null;
    if (!tracker) continue;

    if (tracker === 'youtrack' && s.getItem(KEYS.ytToken)) {
      return {
        tracker,
        figmaToken: s.getItem(KEYS.figma) ?? '',
        figmaUrl: s.getItem(KEYS.figmaUrl) ?? '',
        repoPath: s.getItem(KEYS.repoPath) ?? '',
        youtrackToken: s.getItem(KEYS.ytToken) ?? '',
        youtrackUrl: s.getItem(KEYS.ytUrl) ?? '',
        trelloKey: '', trelloToken: '', trelloBoardId: '',
      };
    }
    if (tracker === 'trello' && s.getItem(KEYS.trelloKey)) {
      return {
        tracker,
        figmaToken: s.getItem(KEYS.figma) ?? '',
        figmaUrl: s.getItem(KEYS.figmaUrl) ?? '',
        repoPath: s.getItem(KEYS.repoPath) ?? '',
        youtrackToken: '', youtrackUrl: '',
        trelloKey: s.getItem(KEYS.trelloKey) ?? '',
        trelloToken: s.getItem(KEYS.trelloToken) ?? '',
        trelloBoardId: s.getItem(KEYS.trelloBoardId) ?? '',
      };
    }
  }
  return null;
}

const credentials = ref<Credentials | null>(load());

export function useAuth() {
  function login(params: LoginParams) {
    const s = params.remember ? localStorage : sessionStorage;
    s.setItem(KEYS.tracker, params.tracker);
    s.setItem(KEYS.figma, params.figmaToken);
    s.setItem(KEYS.figmaUrl, params.figmaUrl);
    s.setItem(KEYS.repoPath, params.repoPath);
    s.setItem(KEYS.ytToken, params.youtrackToken);
    s.setItem(KEYS.ytUrl, params.youtrackUrl);
    s.setItem(KEYS.trelloKey, params.trelloKey);
    s.setItem(KEYS.trelloToken, params.trelloToken);
    s.setItem(KEYS.trelloBoardId, params.trelloBoardId);
    const { remember: _, ...rest } = params;
    credentials.value = rest;
  }

  function logout() {
    [localStorage, sessionStorage].forEach(s =>
      Object.values(KEYS).forEach(k => s.removeItem(k))
    );
    credentials.value = null;
  }

  function authHeaders(): Record<string, string> {
    if (!credentials.value) return {};
    const c = credentials.value;
    return {
      'X-Tracker': c.tracker,
      'X-YouTrack-Token': c.youtrackToken,
      'X-YouTrack-Url': c.youtrackUrl,
      'X-Figma-Token': c.figmaToken,
      'X-Trello-Key': c.trelloKey,
      'X-Trello-Token': c.trelloToken,
      'X-Trello-Board-Id': c.trelloBoardId,
    };
  }

  return { credentials, login, logout, authHeaders };
}
