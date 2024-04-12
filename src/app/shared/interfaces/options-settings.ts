import { UploadParams } from './upload-params';

export interface OptionsSettings extends UploadParams {
  estMemory: string;
  reportsInProgress: number;
  stubStrategies: string[];
}
