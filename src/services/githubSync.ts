import type { AppSettings } from "../types/settings";
import type { UserProfile } from "../types/profile";

const GIST_FILENAME = "vb-settings.json";

export interface GistSyncPayload {
  syncedAt: string;
  userProfile: Omit<UserProfile, "gitCloud"> & {
    gitCloud: Omit<UserProfile["gitCloud"], "githubPAT">;
  };
  settings: Omit<AppSettings, "cloudflareToken">;
}

function buildSyncPayload(
  profile: UserProfile,
  settings: AppSettings,
): GistSyncPayload {
  const { githubPAT: _pat, ...gitCloudRest } = profile.gitCloud;
  const { cloudflareToken: _token, ...settingsRest } = settings;

  return {
    syncedAt: new Date().toISOString(),
    userProfile: {
      ...profile,
      gitCloud: gitCloudRest,
    },
    settings: settingsRest,
  };
}

async function gistRequest(
  method: "POST" | "PATCH",
  pat: string,
  gistId: string | undefined,
  body: Record<string, unknown>,
): Promise<{ id: string }> {
  const url =
    method === "POST"
      ? "https://api.github.com/gists"
      : `https://api.github.com/gists/${gistId}`;

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${pat}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      text.includes("message")
        ? (JSON.parse(text) as { message?: string }).message ??
            `GitHub API hatası (${response.status})`
        : `GitHub API hatası (${response.status})`,
    );
  }

  return response.json() as Promise<{ id: string }>;
}

export async function syncProfileToGist(
  profile: UserProfile,
  settings: AppSettings,
  existingGistId: string,
): Promise<string> {
  const pat = profile.gitCloud.githubPAT.trim();
  if (!pat) {
    throw new Error("GitHub PAT gerekli.");
  }

  const payload = buildSyncPayload(profile, settings);
  const content = JSON.stringify(payload, null, 2);

  const gistBody = {
    description: "VB (Veli-Başlatıcı) profil ve ayar yedeği",
    public: false,
    files: {
      [GIST_FILENAME]: { content },
    },
  };

  if (existingGistId.trim()) {
    const updated = await gistRequest("PATCH", pat, existingGistId.trim(), gistBody);
    return updated.id;
  }

  const created = await gistRequest("POST", pat, undefined, gistBody);
  return created.id;
}
