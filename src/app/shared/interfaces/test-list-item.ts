import { ReranReport } from './reran-report';
import { BaseReport } from './base-report';

export interface TestListItem extends BaseReport {
  fullPath?: string;
  variables?: string;
  extractedVariables?: string;
  reranReport?: ReranReport | null;
  error?: string;
}
