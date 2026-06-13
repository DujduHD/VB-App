import {
  defaultFrameworkByPlatform,
  frameworksByPlatform,
  normalizeFramework,
  supportsWebDeploy,
} from "../constants/platforms";
import type {
  AppPlatform,
  DeployTarget,
  Framework,
  NewProjectForm,
  PackageManager,
  ProjectAnalysis,
} from "../types/project";

const PACKAGE_MANAGERS: PackageManager[] = ["npm", "yarn", "pnpm", "bun"];
const PLATFORMS: AppPlatform[] = ["web", "desktop", "mobile"];
const DEPLOY_TARGETS: DeployTarget[] = [
  "none",
  "vercel",
  "netlify",
  "render",
  "cloudflare-pages",
  "fly-io",
  "railway",
  "aws-amplify",
  "github-pages",
];

export function applyAnalysisToForm(
  base: NewProjectForm,
  analysis: ProjectAnalysis,
): { form: NewProjectForm; importWarnings: string[] } {
  const importWarnings = [...new Set(analysis.unknownFields)];

  let platform = analysis.platform;
  if (!PLATFORMS.includes(platform)) {
    platform = "web";
    if (!importWarnings.includes("platform")) {
      importWarnings.push("platform");
    }
  }

  let framework = normalizeFramework(analysis.framework);
  const allowed = frameworksByPlatform[platform];
  if (!allowed.includes(framework)) {
    if (!importWarnings.includes("framework")) {
      importWarnings.push("framework");
    }
    framework = defaultFrameworkByPlatform[platform];
  }

  let packageManager = analysis.packageManager;
  if (!PACKAGE_MANAGERS.includes(packageManager)) {
    packageManager = "npm";
    if (!importWarnings.includes("packageManager")) {
      importWarnings.push("packageManager");
    }
  }

  let deployTarget = analysis.deployTarget;
  if (!supportsWebDeploy(framework)) {
    deployTarget = "none";
  } else if (!DEPLOY_TARGETS.includes(deployTarget)) {
    deployTarget = "none";
    if (!importWarnings.includes("deployTarget")) {
      importWarnings.push("deployTarget");
    }
  }

  return {
    form: {
      ...base,
      identity: {
        ...base.identity,
        name: analysis.projectName,
      },
      platform,
      framework: framework as Framework,
      packageManager,
      integrations: {
        ...base.integrations,
        dockerEnabled: analysis.dockerEnabled,
      },
      launch: {
        ...base.launch,
        deployTarget,
        gitEnabled: analysis.gitEnabled,
      },
    },
    importWarnings,
  };
}
