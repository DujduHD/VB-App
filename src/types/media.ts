export interface InjectedMediaFile {
  fileName: string;
  projectRelativePath: string;
  publicPath: string;
  kind: string;
}

export interface InjectMediaResult {
  files: InjectedMediaFile[];
  prompt: string;
  targetDir: string;
}
