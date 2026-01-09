export interface UpdateReport {
  name?: string;
  // Empty string is interpreted as request to clear the path
  path?: string;
  // Empty string is interpreted as request to clear the description
  description?: string;
  // Empty string is interpreted as request to clear the transformation
  transformation?: string;
  variables?: Record<string, string>;
  stubStrategy?: string;
}
