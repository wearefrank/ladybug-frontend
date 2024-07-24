export interface CurrentView {
  crudStorage: boolean;
  defaultView: boolean;
  metadataLabels: string[];
  metadataNames: string[];
  metadataTypes: Map<string, string>;
  name: string;
  nodeLinkStrategy: string;
  storageName: string;
}
