export interface View {
  metadataLabels: string[];
  metadataTypes: Map<string, string>;
  defaultView: boolean;
  crudStorage: boolean;
  metadataNames: string[];
  nodeLinkStrategy: string;
  storageName: string;
  name?: string;
}
