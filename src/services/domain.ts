import { invoke } from "@tauri-apps/api/core";
import { isTauri } from "./tauri";

export type DomainAvailability = "available" | "taken";

/** Proje adından domain etiketi üretir (örn. "Focus Flow" → "focusflow") */
export function slugifyDomainLabel(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export const DOMAIN_TLDS = [
  ".com",
  ".io",
  ".dev",
  ".app",
  ".net",
  ".org",
  ".co",
  ".ai",
  ".tech",
  ".xyz",
  ".me",
  ".cloud",
  ".store",
  ".online",
  ".site",
  ".studio",
  ".design",
  ".tools",
] as const;
export type DomainTld = (typeof DOMAIN_TLDS)[number];

function availabilityFromStatus(status: number): DomainAvailability {
  if (status === 404) return "available";
  if (status === 200) return "taken";
  throw new Error(`RDAP beklenmeyen durum kodu: ${status}`);
}

export function formatDomainError(err: unknown): string {
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  if (
    err &&
    typeof err === "object" &&
    "message" in err &&
    typeof (err as { message: unknown }).message === "string"
  ) {
    return (err as { message: string }).message;
  }
  return "Domain sorgusu başarısız.";
}

export async function checkDomainAvailability(
  domain: string,
): Promise<DomainAvailability> {
  const normalized = domain.trim().toLowerCase();
  if (!normalized) {
    throw new Error("Domain adı boş olamaz.");
  }

  if (isTauri()) {
    return invoke<DomainAvailability>("check_domain_availability", {
      domain: normalized,
    });
  }

  const response = await fetch(
    `https://rdap.org/domain/${encodeURIComponent(normalized)}`,
    {
      method: "GET",
      headers: { Accept: "application/rdap+json, application/json" },
      redirect: "follow",
    },
  );

  return availabilityFromStatus(response.status);
}

export interface SetupDnsResult {
  logs: string[];
}

export async function setupProjectDns(params: {
  domain: string;
  token: string;
  deployTarget: string;
  projectPath: string;
}): Promise<SetupDnsResult> {
  if (!isTauri()) {
    throw new Error("Magic DNS yalnızca masaüstü uygulamasında çalışır.");
  }
  return invoke<SetupDnsResult>("setup_project_dns", {
    domain: params.domain,
    token: params.token,
    deployTarget: params.deployTarget,
    projectPath: params.projectPath,
  });
}
