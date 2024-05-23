import { NodeLinkStrategy } from '../enums/compare-method';

export interface View {
  metadataLabels?: string[];
  defaultView?: boolean;
  crudStorage?: boolean;
  metadataNames?: string[];
  nodeLinkStrategy?: NodeLinkStrategy;
  storageName?: string;
  name?: string;
}
