import { ReranReport } from './reran-report';

export interface TestListItem {
  checked: boolean;
  name: string;
  path: string;
  fullPath?: string;
  description: string;
  storageId: number;
  variables?: string;
  extractedVariables?: string;
  reranReport?: ReranReport | null;
  error?: string;
}
