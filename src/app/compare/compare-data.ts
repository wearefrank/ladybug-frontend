import { NodeLinkStrategy } from '../shared/enums/compare-method';

export class CompareData {
  id!: string;
  originalReport: any;
  runResultReport: any;
  viewName: string = '';
  nodeLinkStrategy: NodeLinkStrategy = NodeLinkStrategy.NONE;
}
