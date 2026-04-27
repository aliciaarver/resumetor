import { ref, watch, type Ref } from 'vue';
import { useProjects } from './useProjects';

export interface TaskSettings {
  repoPath: Ref<string>;
  figmaUrl: Ref<string>;
  autoCommit: Ref<boolean>;
  autoMoveTask: Ref<boolean>;
}

type StringField = 'repoPath' | 'figmaUrl';
type BoolField = 'autoCommit' | 'autoMoveTask';

function key(projectId: string, taskId: string, field: StringField | BoolField): string {
  return `project:${projectId}:task:${taskId}:${field}`;
}

function readString(projectId: string, taskId: string, field: StringField): string {
  return localStorage.getItem(key(projectId, taskId, field)) ?? '';
}

function writeString(projectId: string, taskId: string, field: StringField, value: string) {
  const k = key(projectId, taskId, field);
  if (value) localStorage.setItem(k, value);
  else localStorage.removeItem(k);
}

function readBool(projectId: string, taskId: string, field: BoolField): boolean {
  return localStorage.getItem(key(projectId, taskId, field)) === '1';
}

function writeBool(projectId: string, taskId: string, field: BoolField, value: boolean) {
  const k = key(projectId, taskId, field);
  if (value) localStorage.setItem(k, '1');
  else localStorage.removeItem(k);
}

export function useTaskSettings(taskId: string): TaskSettings {
  const { activeProjectId } = useProjects();
  // На момент монтирования карточки проект уже выбран — иначе вкладку с задачами не показали бы.
  // Если вдруг пусто — используем плейсхолдер 'unknown', значения всё равно прилипнут к нему.
  const pid = activeProjectId.value || 'unknown';

  const repoPath = ref(readString(pid, taskId, 'repoPath'));
  const figmaUrl = ref(readString(pid, taskId, 'figmaUrl'));
  const autoCommit = ref(readBool(pid, taskId, 'autoCommit'));
  const autoMoveTask = ref(readBool(pid, taskId, 'autoMoveTask'));

  watch(repoPath, (v) => writeString(pid, taskId, 'repoPath', v.trim()));
  watch(figmaUrl, (v) => writeString(pid, taskId, 'figmaUrl', v.trim()));
  watch(autoCommit, (v) => writeBool(pid, taskId, 'autoCommit', v));
  watch(autoMoveTask, (v) => writeBool(pid, taskId, 'autoMoveTask', v));

  return { repoPath, figmaUrl, autoCommit, autoMoveTask };
}
