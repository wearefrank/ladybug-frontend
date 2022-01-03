import { TreeNode } from './tree-node';
import { Report } from './report';

export interface TreeSettings {
  treeId: string;
  treeLoaded: boolean;
  tree: TreeNode[];
  selectedReports: Report[];
  selectedNode: number;
}
