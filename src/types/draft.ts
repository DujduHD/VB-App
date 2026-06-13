import type { NewProjectForm } from "./project";

export interface ProjectDraft {
  id: string;
  form: NewProjectForm;
  createdAt: string;
  updatedAt: string;
}
