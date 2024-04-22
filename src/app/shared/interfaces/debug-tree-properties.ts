import { Report } from './report';

export interface DebugTreeProperties {
  checkBoxElement: Element;
  checked: boolean;
  disabled: boolean;
  element: Element;
  hasItems: boolean;
  icon: string;
  iconsize: any;
  id: string;
  isExpanded: boolean;
  label: string;
  level: number;
  locked: boolean;
  nextItem: DebugTreeProperties;
  originalTitle: string;
  parentElement: Element;
  parentId: any;
  parentItem: DebugTreeProperties;
  prevItem: DebugTreeProperties;
  selected: boolean;
  subtreeElement: Element;
  titleElement: Element;
  treeInstance: any;
  value: Report;
}
