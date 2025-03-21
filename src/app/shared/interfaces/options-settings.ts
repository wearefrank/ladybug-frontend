import { UploadParams as UploadParameters } from './upload-params';

export interface OptionsSettings extends UploadParameters {
  estMemory: string;
  reportsInProgress: number;
  stubStrategies: string[];
}
