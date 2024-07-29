import { CreateTreeItem } from 'ng-simple-file-tree';

export const SimpleFileTreeUtil = {
  conditionalCssClass(item: CreateTreeItem): string {
    if (!item.uid || !item.iconClass) {
      return 'bi bi-folder icon-size';
    }
    return item.iconClass;
  },
};
