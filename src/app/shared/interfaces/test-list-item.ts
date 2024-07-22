import { ReranReport } from './reran-report';

export interface TestListItem {
  checked: boolean;
  name: string;
  path: string;
  description: string;
  storageId: number;
  variables: string;
  reranReport?: ReranReport;
}
