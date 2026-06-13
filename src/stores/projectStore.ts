import { create } from "zustand";
import type { ProjectDraft } from "../types/draft";
import type {
  ProjectHubMenu,
  SelectedProject,
} from "../types/projectsHub";
import type {
  AppPlatform,
  CodeEditor,
  Framework,
  IntegrationsConfig,
  LaunchConfig,
  NewProjectForm,
  PackageManager,
  ProjectIdentity,
  TimeCapsuleProject,
  VibeConfig,
} from "../types/project";
import type { AppearanceSettings } from "../types/appearance";
import type { ProfileSection, UserProfile } from "../types/profile";
import type { AppSettings, DnsSetupStatus } from "../types/settings";
import {
  loadAppearanceSettings,
  saveAppearanceSettings,
} from "../services/appearanceStorage";
import { loadLanguage, saveLanguage } from "../services/languageStorage";
import i18n from "../i18n";
import type { AppLanguage } from "../types/language";
import {
  loadUserProfile,
  saveUserProfile,
} from "../services/profileStorage";
import { setupProjectDns } from "../services/domain";
import {
  analyzeProject,
  checkDependencies,
  createProject,
  installDependencies,
  wakeProject as wakeProjectTauri,
  removeFromCapsule as removeFromCapsuleTauri,
  removeStagedLogo,
  pickProjectDirectory,
  loadGlobalEnvVault as loadGlobalEnvVaultTauri,
  saveGlobalEnvVault as saveGlobalEnvVaultTauri,
  injectEnv,
} from "../services/tauri";
import type { ApiProvider, InjectEnvResult } from "../types/envVault";
import {
  loadDraftsFromStorage,
  removeDraftFromStorage,
  saveDraftsToStorage,
  upsertDraft,
} from "../services/draft";
import { useNavigationStore } from "./navigationStore";
import { useToastStore } from "./toastStore";
import {
  defaultFrameworkByPlatform,
  frameworksByPlatform,
  supportsWebDeploy,
} from "../constants/platforms";
import { formatError } from "../utils/formatError";
import { applyAnalysisToForm } from "../utils/mapProjectAnalysis";

const defaultIntegrations: IntegrationsConfig = {
  baasProvider: "none",
  databaseUrl: "",
  databaseToken: "",
  databaseSecret: "",
  supabaseUrl: "",
  supabaseAnonKey: "",
  supabaseServiceKey: "",
  firebaseApiKey: "",
  firebaseAuthDomain: "",
  firebaseProjectId: "",
  firebaseAppId: "",
  dockerEnabled: false,
};

const defaultVibe: VibeConfig = {
  uiUxTool: "none",
  musicProvider: "none",
};

const defaultLaunch: LaunchConfig = {
  deployTarget: "none",
  gitEnabled: true,
  openGithub: true,
};

const defaultForm: NewProjectForm = {
  identity: {
    name: "",
    slogan: "",
    logoUrl: "",
    logoFilePath: "",
    logoFileName: "",
    logoSource: "none",
  },
  framework: "nextjs-blank",
  platform: "web",
  packageManager: "pnpm",
  aiTool: "cursor",
  integrations: { ...defaultIntegrations },
  vibe: { ...defaultVibe },
  launch: { ...defaultLaunch },
};

function buildDefaultForm(): NewProjectForm {
  return {
    ...defaultForm,
    identity: { ...defaultForm.identity },
    integrations: { ...defaultIntegrations },
    vibe: { ...defaultVibe },
    launch: { ...defaultLaunch },
  };
}

const CLOUDFLARE_TOKEN_KEY = "vb-cloudflare-token";
const MUSIC_QUERY_KEY = "vb-music-query";
const HAS_SEEN_TOUR_KEY = "vb-has-seen-tour";

function loadSettings(): AppSettings {
  const appearance = loadAppearanceSettings();
  const language = loadLanguage();
  if (typeof localStorage === "undefined") {
    return {
      ...appearance,
      language,
      cloudflareToken: "",
      musicQuery: "",
      hasSeenTour: false,
    };
  }
  return {
    ...appearance,
    language,
    cloudflareToken: localStorage.getItem(CLOUDFLARE_TOKEN_KEY) ?? "",
    musicQuery: localStorage.getItem(MUSIC_QUERY_KEY) ?? "",
    hasSeenTour: localStorage.getItem(HAS_SEEN_TOUR_KEY) === "true",
  };
}

function mergeDraftForm(partial: NewProjectForm): NewProjectForm {
  return {
    ...buildDefaultForm(),
    ...partial,
    identity: { ...defaultForm.identity, ...partial.identity },
    integrations: {
      ...defaultIntegrations,
      ...partial.integrations,
    },
    vibe: {
      ...defaultVibe,
      ...partial.vibe,
      musicProvider:
        partial.vibe?.musicProvider ??
        (partial.vibe as { spotifyEnabled?: boolean })?.spotifyEnabled === false
          ? "none"
          : (partial.vibe as { spotifyEnabled?: boolean })?.spotifyEnabled ===
              true
            ? "spotify"
            : defaultVibe.musicProvider,
    },
    launch: { ...defaultLaunch, ...partial.launch },
  };
}

interface ProjectState {
  form: NewProjectForm;
  timeCapsule: TimeCapsuleProject[];
  drafts: ProjectDraft[];
  activeDraftId: string | null;
  isSubmitting: boolean;
  isCheckingDeps: boolean;
  isInstallingDeps: boolean;
  missingDependencies: string[];
  showDependencyModal: boolean;
  isWaking: string | null;
  logs: string[];
  draftSavedAt: string | null;
  settings: AppSettings;
  userProfile: UserProfile;
  dnsSetupStatus: DnsSetupStatus;
  dnsLogs: string[];
  importWarnings: string[];
  isExternalImport: boolean;
  externalProjectPath: string | null;
  isImporting: boolean;
  selectedProject: SelectedProject | null;
  activeProjectMenu: ProjectHubMenu;
  globalEnvVault: string;
  isVaultLoading: boolean;
  isVaultSaving: boolean;
  isInjectingEnv: boolean;

  setTimeCapsule: (projects: TimeCapsuleProject[]) => void;
  setCloudflareToken: (token: string) => void;
  setMusicQuery: (query: string) => void;
  setLanguage: (language: AppLanguage) => void;
  setHasSeenTour: (seen: boolean) => void;
  setAppearance: (patch: Partial<AppearanceSettings>) => void;
  setProfileSection: <K extends ProfileSection>(
    section: K,
    patch: Partial<UserProfile[K]>,
  ) => void;
  setProfileField: (
    section: ProfileSection,
    field: string,
    value: string | number,
  ) => void;
  setGistSyncId: (gistSyncId: string) => void;
  incrementSpawnCount: (framework: string) => void;
  runMagicDns: (domain: string, projectPath: string) => Promise<void>;
  clearDnsState: () => void;
  setIdentity: (identity: Partial<ProjectIdentity>) => void;
  setFramework: (framework: Framework) => void;
  setPlatform: (platform: AppPlatform) => void;
  setPackageManager: (pm: PackageManager) => void;
  setCodeEditor: (editor: CodeEditor) => void;
  setIntegrations: (integrations: Partial<IntegrationsConfig>) => void;
  setVibe: (vibe: Partial<VibeConfig>) => void;
  setLaunch: (launch: Partial<LaunchConfig>) => void;
  resetForm: () => void;
  clearImportState: () => void;
  importExternalProject: () => Promise<void>;
  hydrateDrafts: () => void;
  saveDraft: () => void;
  loadDraft: (id: string) => void;
  deleteDraft: (id: string) => void;
  clearForm: () => void;
  clearLogs: () => void;
  dismissDependencyModal: () => void;
  installMissingAndContinue: () => Promise<void>;
  executeCreateProject: () => Promise<void>;
  submitProject: () => Promise<void>;
  wakeProject: (id: string) => Promise<void>;
  removeFromCapsule: (id: string) => Promise<void>;
  setSelectedProject: (project: SelectedProject | null) => void;
  setActiveProjectMenu: (menu: ProjectHubMenu) => void;
  clearSelectedProject: () => void;
  setGlobalEnvVault: (content: string) => void;
  loadGlobalEnvVault: () => Promise<void>;
  saveGlobalEnvVault: () => Promise<void>;
  injectApiToProject: (
    provider: ApiProvider,
    projectPath: string,
    envContent: string,
  ) => Promise<InjectEnvResult | null>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  form: buildDefaultForm(),
  timeCapsule: [],
  drafts: loadDraftsFromStorage(),
  activeDraftId: null,
  isSubmitting: false,
  isCheckingDeps: false,
  isInstallingDeps: false,
  missingDependencies: [],
  showDependencyModal: false,
  isWaking: null,
  logs: [],
  draftSavedAt: null,
  settings: loadSettings(),
  userProfile: loadUserProfile(),
  dnsSetupStatus: "idle",
  dnsLogs: [],
  importWarnings: [],
  isExternalImport: false,
  externalProjectPath: null,
  isImporting: false,
  selectedProject: null,
  activeProjectMenu: "vitrin",
  globalEnvVault: "",
  isVaultLoading: false,
  isVaultSaving: false,
  isInjectingEnv: false,

  setTimeCapsule: (projects) => set({ timeCapsule: projects }),

  setSelectedProject: (selectedProject) =>
    set({
      selectedProject,
      activeProjectMenu: "vitrin",
    }),

  setActiveProjectMenu: (activeProjectMenu) => set({ activeProjectMenu }),

  clearSelectedProject: () =>
    set({ selectedProject: null, activeProjectMenu: "vitrin" }),

  setGlobalEnvVault: (globalEnvVault) => set({ globalEnvVault }),

  loadGlobalEnvVault: async () => {
    set({ isVaultLoading: true });
    try {
      const content = await loadGlobalEnvVaultTauri();
      set({ globalEnvVault: content, isVaultLoading: false });
    } catch {
      set({ isVaultLoading: false });
    }
  },

  saveGlobalEnvVault: async () => {
    const showToast = useToastStore.getState().show;
    set({ isVaultSaving: true });
    try {
      await saveGlobalEnvVaultTauri(get().globalEnvVault);
      set({ isVaultSaving: false });
      showToast(i18n.t("projectsHub.env.saveSuccess"), "success");
    } catch (err) {
      const msg = formatError(err, i18n.t("projectsHub.env.saveFailed"));
      set({ isVaultSaving: false });
      showToast(msg, "error");
    }
  },

  injectApiToProject: async (provider, projectPath, envContent) => {
    const showToast = useToastStore.getState().show;
    set({ isInjectingEnv: true });
    try {
      const result = await injectEnv(projectPath, provider, envContent);
      set({ isInjectingEnv: false });
      showToast(result.message, "success");
      return result;
    } catch (err) {
      const msg = formatError(err, i18n.t("projectsHub.api.injectFailed"));
      set({ isInjectingEnv: false });
      showToast(msg, "error");
      return null;
    }
  },

  setCloudflareToken: (token) => {
    localStorage.setItem(CLOUDFLARE_TOKEN_KEY, token);
    set((state) => ({
      settings: { ...state.settings, cloudflareToken: token },
    }));
  },

  setMusicQuery: (musicQuery) => {
    localStorage.setItem(MUSIC_QUERY_KEY, musicQuery);
    set((state) => ({
      settings: { ...state.settings, musicQuery },
    }));
  },

  setLanguage: (language) => {
    saveLanguage(language);
    void i18n.changeLanguage(language);
    set((state) => ({
      settings: { ...state.settings, language },
    }));
  },

  setHasSeenTour: (seen) => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(HAS_SEEN_TOUR_KEY, seen ? "true" : "false");
    }
    set((state) => ({
      settings: { ...state.settings, hasSeenTour: seen },
    }));
  },

  setAppearance: (patch) => {
    set((state) => {
      const next: AppSettings = { ...state.settings, ...patch };
      saveAppearanceSettings({
        accentColor: next.accentColor,
        density: next.density,
        terminalFont: next.terminalFont,
        animationLevel: next.animationLevel,
      });
      return { settings: next };
    });
  },

  setProfileSection: (section, patch) => {
    set((state) => {
      const next: UserProfile = {
        ...state.userProfile,
        [section]: {
          ...state.userProfile[section],
          ...patch,
        },
      };
      saveUserProfile(next);
      return { userProfile: next };
    });
  },

  setProfileField: (section, field, value) => {
    set((state) => {
      const next: UserProfile = {
        ...state.userProfile,
        [section]: {
          ...state.userProfile[section],
          [field]: value,
        },
      };
      saveUserProfile(next);
      return { userProfile: next };
    });
  },

  setGistSyncId: (gistSyncId) => {
    set((state) => {
      const next: UserProfile = {
        ...state.userProfile,
        gitCloud: { ...state.userProfile.gitCloud, gistSyncId },
      };
      saveUserProfile(next);
      return { userProfile: next };
    });
  },

  incrementSpawnCount: (framework) => {
    set((state) => {
      const { metrics } = state.userProfile;
      const next: UserProfile = {
        ...state.userProfile,
        metrics: {
          ...metrics,
          totalSpawns: metrics.totalSpawns + 1,
          topFramework: framework,
        },
      };
      saveUserProfile(next);
      return { userProfile: next };
    });
  },

  runMagicDns: async (domain, projectPath) => {
    const { settings, form } = get();
    const showToast = useToastStore.getState().show;

    if (!settings.cloudflareToken.trim()) {
      showToast(i18n.t("toast.cloudflareTokenRequired"), "error");
      return;
    }
    if (form.launch.deployTarget === "none") {
      showToast(i18n.t("toast.deployTargetRequired"), "error");
      return;
    }
    if (!projectPath.trim()) {
      showToast(i18n.t("toast.projectPathRequired"), "error");
      return;
    }

    set({
      dnsSetupStatus: "loading",
      dnsLogs: ["Magic DNS başlatılıyor..."],
    });

    try {
      const result = await setupProjectDns({
        domain,
        token: settings.cloudflareToken,
        deployTarget: form.launch.deployTarget,
        projectPath: projectPath.trim(),
      });
      set({ dnsSetupStatus: "success", dnsLogs: result.logs });
      showToast(i18n.t("toast.dnsSuccess"), "success");
    } catch (err) {
      const msg = formatError(err, i18n.t("toast.dnsFailed"));
      set({ dnsSetupStatus: "error", dnsLogs: [msg] });
      showToast(msg, "error");
    }
  },

  clearDnsState: () => set({ dnsSetupStatus: "idle", dnsLogs: [] }),

  setIdentity: (identity) =>
    set((state) => ({
      form: {
        ...state.form,
        identity: { ...state.form.identity, ...identity },
      },
    })),

  setFramework: (framework) =>
    set((state) => {
      const deployTarget = supportsWebDeploy(framework)
        ? state.form.launch.deployTarget
        : "none";
      return {
        form: {
          ...state.form,
          framework,
          launch: { ...state.form.launch, deployTarget },
        },
        importWarnings: state.importWarnings.filter((f) => f !== "framework"),
      };
    }),

  setPlatform: (platform) =>
    set((state) => {
      const allowed = frameworksByPlatform[platform];
      const framework = allowed.includes(state.form.framework)
        ? state.form.framework
        : defaultFrameworkByPlatform[platform];
      const deployTarget =
        supportsWebDeploy(framework) || state.form.launch.deployTarget === "none"
          ? state.form.launch.deployTarget
          : "none";
      return {
        form: {
          ...state.form,
          platform,
          framework,
          launch: { ...state.form.launch, deployTarget },
        },
        importWarnings: state.importWarnings.filter((f) => f !== "platform"),
      };
    }),

  setPackageManager: (packageManager) =>
    set((state) => ({
      form: { ...state.form, packageManager },
      importWarnings: state.importWarnings.filter((f) => f !== "packageManager"),
    })),

  setCodeEditor: (aiTool) =>
    set((state) => ({
      form: { ...state.form, aiTool },
    })),

  setIntegrations: (integrations) =>
    set((state) => ({
      form: {
        ...state.form,
        integrations: { ...state.form.integrations, ...integrations },
      },
    })),

  setVibe: (vibe) =>
    set((state) => ({
      form: {
        ...state.form,
        vibe: { ...state.form.vibe, ...vibe },
      },
    })),

  setLaunch: (launch) =>
    set((state) => ({
      form: {
        ...state.form,
        launch: { ...state.form.launch, ...launch },
      },
      importWarnings:
        launch.deployTarget !== undefined
          ? state.importWarnings.filter((f) => f !== "deployTarget")
          : state.importWarnings,
    })),

  resetForm: () =>
    set({
      form: buildDefaultForm(),
      activeDraftId: null,
      draftSavedAt: null,
      importWarnings: [],
      isExternalImport: false,
      externalProjectPath: null,
    }),

  clearImportState: () =>
    set({
      importWarnings: [],
      isExternalImport: false,
      externalProjectPath: null,
    }),

  importExternalProject: async () => {
    const showToast = useToastStore.getState().show;

    if (get().isImporting) return;

    set({ isImporting: true });

    try {
      const picked = await pickProjectDirectory();
      if (!picked) {
        set({ isImporting: false });
        return;
      }

      const analysis = await analyzeProject(picked);
      const { form, importWarnings } = applyAnalysisToForm(
        buildDefaultForm(),
        analysis,
      );

      set({
        form,
        importWarnings,
        isExternalImport: true,
        externalProjectPath: picked,
        activeDraftId: null,
        draftSavedAt: null,
        isImporting: false,
      });

      useNavigationStore.getState().setView("home");

      if (importWarnings.length > 0) {
        showToast(
          i18n.t("toast.importSuccessWithWarnings", {
            name: form.identity.name,
            count: importWarnings.length,
          }),
          "info",
        );
      } else {
        showToast(
          i18n.t("toast.importSuccess", { name: form.identity.name }),
          "success",
        );
      }
    } catch (err) {
      const msg = formatError(err, i18n.t("toast.importFailed"));
      set({ isImporting: false });
      showToast(msg, "error");
    }
  },

  hydrateDrafts: () => {
    set({ drafts: loadDraftsFromStorage() });
  },

  saveDraft: () => {
    const { form, activeDraftId, drafts } = get();
    const showToast = useToastStore.getState().show;
    const { drafts: nextDrafts, draft } = upsertDraft(drafts, form, activeDraftId);
    saveDraftsToStorage(nextDrafts);

    set({
      drafts: nextDrafts,
      activeDraftId: draft.id,
      draftSavedAt: draft.updatedAt,
    });

    const label =
      form.identity.name.trim() || i18n.t("drafts.unnamedDraft");
    showToast(i18n.t("toast.draftSaved", { label }), "success");
  },

  loadDraft: (id) => {
    const draft = get().drafts.find((d) => d.id === id);
    if (!draft) return;

    const showToast = useToastStore.getState().show;
    set({
      form: mergeDraftForm(draft.form),
      activeDraftId: id,
      draftSavedAt: draft.updatedAt,
      importWarnings: [],
      isExternalImport: false,
      externalProjectPath: null,
    });
    useNavigationStore.getState().setView("home");
    const label =
      draft.form.identity.name.trim() || i18n.t("drafts.unnamedDraft");
    showToast(i18n.t("toast.draftLoaded", { label }), "success");
  },

  deleteDraft: (id) => {
    const { drafts } = get();
    const next = removeDraftFromStorage(drafts, id);
    saveDraftsToStorage(next);

    set((state) => ({
      drafts: next,
      ...(state.activeDraftId === id
        ? { activeDraftId: null, draftSavedAt: null }
        : {}),
    }));

    useToastStore.getState().show(i18n.t("toast.draftDeleted"), "info");
  },

  clearForm: () => {
    const showToast = useToastStore.getState().show;
    const { form } = get();
    if (form.identity.logoFilePath) {
      removeStagedLogo(form.identity.logoFilePath).catch(() => {});
    }
    set({
      form: buildDefaultForm(),
      activeDraftId: null,
      draftSavedAt: null,
      importWarnings: [],
      isExternalImport: false,
      externalProjectPath: null,
    });
    showToast(i18n.t("toast.formCleared"), "success");
  },

  clearLogs: () => set({ logs: [] }),

  dismissDependencyModal: () =>
    set({
      showDependencyModal: false,
      missingDependencies: [],
      isCheckingDeps: false,
      isInstallingDeps: false,
    }),

  executeCreateProject: async () => {
    const {
      form,
      activeDraftId,
      drafts,
      settings,
      isExternalImport,
      externalProjectPath,
    } = get();
    const showToast = useToastStore.getState().show;
    set({
      isSubmitting: true,
      logs: [
        isExternalImport
          ? "Mevcut proje Zaman Kapsülüne ekleniyor..."
          : "Proje oluşturuluyor...",
      ],
    });

    try {
      const result = await createProject(
        form,
        settings.musicQuery,
        get().userProfile,
        isExternalImport ? externalProjectPath : null,
      );

      let nextDrafts = drafts;
      if (activeDraftId) {
        nextDrafts = removeDraftFromStorage(drafts, activeDraftId);
        saveDraftsToStorage(nextDrafts);
      }

      set((state) => ({
        timeCapsule: [result.project, ...state.timeCapsule],
        form: buildDefaultForm(),
        drafts: nextDrafts,
        activeDraftId: null,
        draftSavedAt: null,
        logs: result.logs,
        isSubmitting: false,
        missingDependencies: [],
        showDependencyModal: false,
        importWarnings: [],
        isExternalImport: false,
        externalProjectPath: null,
      }));
      get().incrementSpawnCount(form.framework);
      showToast(
        i18n.t("toast.projectReady", { name: result.project.name }),
        "success",
      );
    } catch (err) {
      const msg = formatError(err, i18n.t("toast.projectCreateFailed"));
      set({ isSubmitting: false, logs: [msg] });
      showToast(msg, "error");
    }
  },

  installMissingAndContinue: async () => {
    const { form, missingDependencies } = get();
    const showToast = useToastStore.getState().show;

    if (missingDependencies.length === 0) {
      await get().executeCreateProject();
      return;
    }

    set({
      isInstallingDeps: true,
      showDependencyModal: false,
      logs: ["Eksik araçlar kuruluyor..."],
    });

    try {
      const installLogs = await installDependencies(form, missingDependencies);
      set((state) => ({
        logs: [...state.logs, ...installLogs],
        isInstallingDeps: false,
        missingDependencies: [],
      }));
      await get().executeCreateProject();
    } catch (err) {
      const msg = formatError(err, i18n.t("toast.depsInstallFailed"));
      set({
        isInstallingDeps: false,
        showDependencyModal: true,
        logs: [msg],
      });
      showToast(msg, "error");
    }
  },

  submitProject: async () => {
    const { form } = get();
    if (!form.identity.name.trim()) return;

    const showToast = useToastStore.getState().show;
    set({ isCheckingDeps: true, logs: ["Sistem taranıyor..."] });

    try {
      const missing = await checkDependencies(form);
      set({ isCheckingDeps: false });

      if (missing.length > 0) {
        set({
          missingDependencies: missing,
          showDependencyModal: true,
          logs: [`Eksik araçlar: ${missing.join(", ")}`],
        });
        return;
      }

      await get().executeCreateProject();
    } catch (err) {
      const msg = formatError(err, i18n.t("toast.depsCheckFailed"));
      set({ isCheckingDeps: false, logs: [msg] });
      showToast(msg, "error");
    }
  },

  wakeProject: async (id) => {
    const showToast = useToastStore.getState().show;
    const musicQuery = get().settings.musicQuery;
    set({ isWaking: id });

    try {
      const result = await wakeProjectTauri(
        id,
        musicQuery,
        get().userProfile.aiPreferences.customPromptContext,
      );
      showToast(i18n.t("toast.wakeSuccess"), "success");
      set({ logs: result.logs, isWaking: null });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : i18n.t("toast.wakeFailed");
      showToast(msg, "error");
      set({ isWaking: null });
    }
  },

  removeFromCapsule: async (id) => {
    const projects = await removeFromCapsuleTauri(id);
    set({ timeCapsule: projects });
  },
}));
