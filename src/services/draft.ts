import type { ProjectDraft } from "../types/draft";
import type { NewProjectForm } from "../types/project";

const DRAFTS_KEY = "vb-drafts";
const LEGACY_DRAFT_KEY = "vb-project-draft";

function cloneForm(form: NewProjectForm): NewProjectForm {
  return JSON.parse(JSON.stringify(form)) as NewProjectForm;
}

function migrateLegacyDraft(drafts: ProjectDraft[]): ProjectDraft[] {
  try {
    const raw = localStorage.getItem(LEGACY_DRAFT_KEY);
    if (!raw) return drafts;

    const legacy = JSON.parse(raw) as { form: NewProjectForm; savedAt: string };
    localStorage.removeItem(LEGACY_DRAFT_KEY);

    return [
      {
        id: crypto.randomUUID(),
        form: cloneForm(legacy.form),
        createdAt: legacy.savedAt,
        updatedAt: legacy.savedAt,
      },
      ...drafts,
    ];
  } catch {
    localStorage.removeItem(LEGACY_DRAFT_KEY);
    return drafts;
  }
}

export function loadDraftsFromStorage(): ProjectDraft[] {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    const parsed = raw ? (JSON.parse(raw) as ProjectDraft[]) : [];
    const drafts = Array.isArray(parsed) ? parsed : [];
    const migrated = migrateLegacyDraft(drafts);
    if (migrated.length !== drafts.length) {
      saveDraftsToStorage(migrated);
    }
    return migrated;
  } catch {
    return [];
  }
}

export function saveDraftsToStorage(drafts: ProjectDraft[]): void {
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
}

export function upsertDraft(
  drafts: ProjectDraft[],
  form: NewProjectForm,
  activeDraftId: string | null,
): { drafts: ProjectDraft[]; draft: ProjectDraft } {
  const now = new Date().toISOString();
  const cloned = cloneForm(form);

  if (activeDraftId) {
    const existing = drafts.find((d) => d.id === activeDraftId);
    if (existing) {
      const updated: ProjectDraft = {
        ...existing,
        form: cloned,
        updatedAt: now,
      };
      return {
        drafts: drafts.map((d) => (d.id === activeDraftId ? updated : d)),
        draft: updated,
      };
    }
  }

  const created: ProjectDraft = {
    id: crypto.randomUUID(),
    form: cloned,
    createdAt: now,
    updatedAt: now,
  };
  return { drafts: [created, ...drafts], draft: created };
}

export function removeDraftFromStorage(
  drafts: ProjectDraft[],
  id: string,
): ProjectDraft[] {
  return drafts.filter((d) => d.id !== id);
}
