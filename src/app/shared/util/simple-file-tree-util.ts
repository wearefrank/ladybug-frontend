import { CreateTreeItem, FileTreeItem, TreeItemComponent } from 'ng-simple-file-tree';

export const SimpleFileTreeUtil = {
  conditionalCssClass(item: CreateTreeItem): string {
    if (!item.uid || !item.iconClass) {
      return 'bi bi-folder icon-size';
    }
    return item.iconClass;
  },

  hideOrShowCheckpoints(unmatched: string[], items: TreeItemComponent[]): void {
    console.log('SimpleFileTreeUtil.hideOrShowCheckpoint()');
    for (const u of unmatched) {
      console.log(`From list unmatched: ${u}`);
    }
    for (let item of items) {
      this.logTree(item.item);
      if (unmatched.length === 0 || !unmatched) {
        item.setVisible(true);
      } else if (unmatched.includes(item.item.originalValue.uid)) {
        item.setVisible(false);
      }
      if (item.item.children) {
        this.hideOrShowCheckpoints(unmatched, [item.childElement]);
      }
    }
  },

  // eslint-disable-next-line no-unused-vars
  visitTree(item: FileTreeItem, depth: number, handler: (item: FileTreeItem, depth: number) => void): void {
    handler(item, depth);
    if (item.hasChildren()) {
      for (const child of item.children!) {
        this.visitTree(child, depth + 1, handler);
      }
    }
  },

  logTree(root: FileTreeItem): void {
    this.visitTree(root, 0, (item: FileTreeItem, depth: number) => {
      if (depth === 0) {
        console.log('Logging a tree');
      }
      const indent = '  '.repeat(depth);
      console.log(`${indent} * ${item.originalValue.uid}`);
    });
  },
};
