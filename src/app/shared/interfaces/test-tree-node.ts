export interface TestTreeNode {
  text: string;
  filter: string;
  nodes: TestTreeNode[];
  state: {
    expanded: boolean;
    selected?: boolean;
  };
  nodeId?: number;
}
