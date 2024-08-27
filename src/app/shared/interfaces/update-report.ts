import { ReportStubStrategy } from '../enums/stub-strategy';

export interface UpdateReport {
  name?: string;
  path?: string;
  description?: string;
  transformation?: string;
  variables?: string;
  stubStrategy?: ReportStubStrategy;
}
