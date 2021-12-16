export interface TreeNode {
  text: string,
  ladybug: any,
  root: boolean,
  id: number,
  nodes?: TreeNode[],
  level: number,
  nodeId?: number
}
