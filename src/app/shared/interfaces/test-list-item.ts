import { ReranReport } from './reran-report';
import { BaseReport } from './base-report';

export interface TestListItem extends BaseReport {
  fullPath?: string;
  reranReport?: ReranReport | null;
  error?: string;
  variableCsv?: string;
  variableMap: Record<string, string>;
}
