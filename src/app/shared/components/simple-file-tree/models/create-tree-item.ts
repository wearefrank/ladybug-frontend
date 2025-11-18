export interface CreateTreeItem {
  name: string;
  childrenKey?: string;
  children?: CreateTreeItem[];
  icon?: string;
  treePath?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}
