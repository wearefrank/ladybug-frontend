import { CreateTreeItem } from './create-tree-item';
import type { NgSimpleFileTree } from '../ng-simple-file-tree.component';

export class FileTreeItem {
  name: string;
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  originalValue: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private constructor(name: string, parentTree: NgSimpleFileTree, originalValue: any, optional: OptionalParameters) {
    if (optional.nameAttribute) {
      this.name = originalValue[optional.nameAttribute];
    } else {
      this.name = name;
    }
    if (!this.name) {
      this.name = 'null';
    }
    this.originalValue = originalValue;
    this.index = optional.index;
    this.parent = optional.parent;
    this.icon = optional.icon;
    this.pathAttribute = optional.pathAttributes;

    if (optional.pathAttributes && originalValue) {
      this.path = optional.path ?? FileTreeItem.buildPath(originalValue, optional.pathAttributes);
    } else {
      this.path = optional.path ?? this.name;
    }
    if (this.name && this.name.includes('.')) {
      const split = this.name.split('.');
      this.extension = split.at(-1);
    }

    if (optional.childrenKey) {
      this.childrenKey = optional.childrenKey;
      this.createChildren(originalValue[optional.childrenKey], parentTree, optional);
    } else if (optional.children && optional.children.length > 0) {
      this.createChildren(optional.children, parentTree, optional);
    } else {
      this.children = [] as FileTreeItem[];
    }
    this.expanded = !!(parentTree.options.expandAllFolders && this.hasChildren());
  }

  extension?: string;
  children?: FileTreeItem[];
  icon?: string;
  parent?: FileTreeItem;
  index?: number;

  visible = true;
  currentlySelected = false;
  expanded!: boolean;
  selectedChildIndex = -1;
  private readonly childrenKey?: string;
  public readonly pathAttribute?: string[];
  fontColor?: string;

  public hasChildren(): boolean {
    return !!this.children && this.children.length > 0;
  }

  private createChildren(children: CreateTreeItem[], parentTree: NgSimpleFileTree, optional: OptionalParameters): void {
    const newChildrenList: FileTreeItem[] = [];
    if (children) {
      for (let child of children) {
        let children;
        if (optional.childrenKey) {
          children = child[optional.childrenKey];
        } else {
          children = child.children;
        }

        let name;
        if (optional.nameAttribute) {
          name = child[optional.nameAttribute];
        } else {
          name = child.name;
        }

        let path;
        if (optional.pathAttributes && optional.path) {
          path = `${optional.path}/${FileTreeItem.buildPath(child, optional.pathAttributes)}`;
        } else if (this.pathAttribute && optional.path) {
          path = `${optional.path}/${FileTreeItem.buildPath(child, this.pathAttribute)}`;
        } else if (child.treePath) {
          path = `${child.treePath}/${name}`;
        } else {
          path = `${optional.path}/${name}`;
        }

        if (this.childrenKey && child[this.childrenKey]) {
          children = child[this.childrenKey];
        }

        newChildrenList.push(
          new FileTreeItem(name, parentTree, child, {
            childrenKey: this.childrenKey,
            children: children,
            icon: child.icon,
            path: path,
            parent: this,
            pathAttributes: this.pathAttribute ?? optional.pathAttributes,
            nameAttribute: optional.nameAttribute,
          }),
        );
      }
      this.children = newChildrenList;
    }
  }

  getPathAttribute(): string {
    if (this.pathAttribute) {
      return this.pathAttribute.map((attr) => this.originalValue[attr]).join('/');
    }
    return this.name;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static buildPath(value: any, attributes: string[]): string {
    return attributes.map((attr) => value[attr]).join('|');
  }

  public static fromJson(
    item: CreateTreeItem,
    parentTree: NgSimpleFileTree,
    optional: OptionalParameters,
  ): FileTreeItem {
    let name;
    if (optional.nameAttribute) {
      name = item[optional.nameAttribute];
    } else {
      name = item.name;
    }
    const _childrenKey = optional.childrenKey;
    let children = item.children;
    let path = item.treePath ?? name;
    if (optional.pathAttributes && item) {
      path = optional.path ?? FileTreeItem.buildPath(item, optional.pathAttributes);
    }
    if (_childrenKey) {
      children = item[_childrenKey];
    }
    item.treePath = path;
    return new FileTreeItem(name, parentTree, item, {
      childrenKey: _childrenKey,
      children: children,
      icon: item.icon,
      path: path,
      pathAttributes: optional.pathAttributes,
    });
  }

  setFontColor(value: string): void {
    this.fontColor = value;
  }
}

export interface OptionalParameters {
  pathAttributes?: string[];
  childrenKey?: string;
  children?: CreateTreeItem[];
  icon?: string;
  path?: string;
  parent?: FileTreeItem;
  index?: number;
  nameAttribute?: string;
}
