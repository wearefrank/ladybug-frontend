import { Report } from './report';
import { TreeNode } from './tree-node';

export interface CompareReport {
  reports: Report[];
  id: string;
  current: TreeNode;
  selected: boolean;
}
