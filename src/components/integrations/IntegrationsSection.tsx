import { memo } from "react";
import { BaasProviderGrid } from "./BaasProviderGrid";
import { BaasCredentialFields } from "./BaasCredentialFields";
import { DockerToggle } from "./DockerToggle";

export const IntegrationsSection = memo(function IntegrationsSection() {
  return (
    <div className="space-y-6">
      <div>
        <BaasProviderGrid />
        <BaasCredentialFields />
      </div>
      <DockerToggle />
    </div>
  );
});
