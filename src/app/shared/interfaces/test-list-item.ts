import { ReranReport } from './reran-report';
import { BaseReport } from './base-report';

export interface TestListItem extends BaseReport {
  name: string;
  path: string;
  fullPath?: string;
  description: string;
  variables?: string;
  extractedVariables?: string;
  reranReport?: ReranReport | null;
  error?: string;
}
