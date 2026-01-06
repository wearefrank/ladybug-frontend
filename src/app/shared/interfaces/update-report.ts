export interface UpdateReport {
  name?: string;
  clearPath?: boolean;
  path?: string;
  clearDescription?: boolean;
  description?: string;
  clearTransformation?: boolean;
  transformation?: string;
  variables?: Record<string, string>;
  stubStrategy?: string;
}
